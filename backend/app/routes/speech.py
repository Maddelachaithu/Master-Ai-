import uuid
import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.config import settings
from app.schemas.speech import TranscriptionResponse, SpeechHealthResponse
from app.services.whisper_service import whisper_service

logger = logging.getLogger("master_ai.routes.speech")
router = APIRouter(prefix="/speech", tags=["Speech"])


@router.get("/health", response_model=SpeechHealthResponse)
async def get_speech_health():
    """Check Whisper speech transcription subsystem availability."""
    available = whisper_service.is_available()
    return SpeechHealthResponse(
        status="ready" if available else "degraded",
        whisper_available=available,
        whisper_model=settings.WHISPER_MODEL,
        device=settings.WHISPER_DEVICE,
    )


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe candidate microphone recording.
    The audio file is stored temporarily during Whisper inference and deleted immediately afterwards.
    """
    if not file:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No audio file provided.")

    logger.info(f"[WHISPER DEBUG] POST /api/speech/transcribe received: filename='{file.filename}', content_type='{file.content_type}'")

    # Generate isolated temp path
    suffix = Path(file.filename).suffix or ".webm"
    temp_filename = f"rec_{uuid.uuid4().hex}{suffix}"
    temp_path = settings.TEMP_AUDIO_DIR / temp_filename

    try:
        # Read and write chunks to disk
        contents = await file.read()
        logger.info(f"[WHISPER DEBUG] uploaded audio payload size: {len(contents)} bytes")

        if len(contents) > settings.MAX_AUDIO_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Audio file exceeds maximum size limit (25MB).",
            )
        if len(contents) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded audio file is empty (0 bytes).",
            )

        with open(temp_path, "wb") as f:
            f.write(contents)

        # Transcribe with Whisper
        result = await whisper_service.transcribe_audio_file(temp_path)
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to transcribe audio: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Speech transcription failed: {str(e)}",
        )
    finally:
        # Strict privacy cleanup: delete raw audio recording immediately
        if temp_path.exists():
            try:
                temp_path.unlink()
                logger.debug(f"Securely deleted temporary audio file: {temp_path}")
            except Exception as cleanup_err:
                logger.warning(f"Could not delete temporary audio file {temp_path}: {cleanup_err}")
