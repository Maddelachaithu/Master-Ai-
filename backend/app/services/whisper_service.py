import os
import logging
from pathlib import Path
from typing import Optional
from app.config import settings
from app.schemas.speech import TranscriptionResponse, TranscriptionSegment

logger = logging.getLogger("master_ai.whisper")

# Lazy-loaded model instance
_whisper_model_instance = None


def get_whisper_model():
    global _whisper_model_instance
    if _whisper_model_instance is None:
        try:
            from faster_whisper import WhisperModel
            logger.info(
                f"Loading faster-whisper model: {settings.WHISPER_MODEL} on {settings.WHISPER_DEVICE} ({settings.WHISPER_COMPUTE_TYPE})"
            )
            _whisper_model_instance = WhisperModel(
                settings.WHISPER_MODEL,
                device=settings.WHISPER_DEVICE,
                compute_type=settings.WHISPER_COMPUTE_TYPE,
                download_root=os.path.join(os.path.expanduser("~"), ".cache", "whisper"),
            )
            logger.info("faster-whisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load faster-whisper model: {e}", exc_info=True)
            raise e
    return _whisper_model_instance


class WhisperService:
    def __init__(self):
        self.model_name = settings.WHISPER_MODEL

    def is_available(self) -> bool:
        """Check if faster-whisper package and backend are available without blocking."""
        try:
            import faster_whisper
            return True
        except ImportError:
            return False

    def is_loaded(self) -> bool:
        global _whisper_model_instance
        return _whisper_model_instance is not None

    async def transcribe_audio_file(self, file_path: Path) -> TranscriptionResponse:
        """
        Transcribe an uploaded audio file using faster-whisper.
        Extracts full text, language, audio duration, and timestamped segments.
        """
        if not file_path.exists():
            raise FileNotFoundError(f"Audio file not found at {file_path}")

        try:
            model = get_whisper_model()
            file_size = file_path.stat().st_size
            logger.info(f"[WHISPER DEBUG] audio received: {file_path}")
            logger.info(f"[WHISPER DEBUG] file size: {file_size} bytes")

            # Run transcription with English language enforcement and fast greedy decoding (beam_size=1)
            segments_generator, info = model.transcribe(
                str(file_path),
                language="en",
                beam_size=1,
                best_of=1,
                temperature=0.0,
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=250),
            )

            segments = []
            full_text_parts = []

            for seg in segments_generator:
                cleaned_text = seg.text.strip()
                if cleaned_text:
                    segments.append(
                        TranscriptionSegment(
                            start=round(seg.start, 2),
                            end=round(seg.end, 2),
                            text=cleaned_text,
                        )
                    )
                    full_text_parts.append(cleaned_text)

            logger.info(f"[WHISPER DEBUG] VAD result count: {len(full_text_parts)}")

            # Fallback: If VAD filter yielded 0 words, retry without VAD in case candidate spoke softly or briefly
            if not full_text_parts:
                logger.info("[WHISPER DEBUG] VAD returned 0 words, retrying without VAD...")
                segments_gen_novad, info_novad = model.transcribe(
                    str(file_path),
                    language="en",
                    beam_size=1,
                    best_of=1,
                    temperature=0.0,
                    vad_filter=False,
                )
                for seg in segments_gen_novad:
                    cleaned_text = seg.text.strip()
                    if cleaned_text:
                        segments.append(
                            TranscriptionSegment(
                                start=round(seg.start, 2),
                                end=round(seg.end, 2),
                                text=cleaned_text,
                            )
                        )
                        full_text_parts.append(cleaned_text)
                if full_text_parts:
                    info = info_novad

            full_text = " ".join(full_text_parts).strip()

            logger.info(f"[WHISPER DEBUG] segments returned: {len(segments)}")
            logger.info(f"[WHISPER DEBUG] transcript length: {len(full_text)}")
            logger.info(f"[WHISPER DEBUG] transcription complete: '{full_text[:80]}' (words: {len(full_text.split())})")

            return TranscriptionResponse(
                text=full_text,
                language=info.language or "en",
                duration=round(info.duration, 2),
                segments=segments,
            )

        except Exception as e:
            logger.error(f"[WHISPER DEBUG] Error during Whisper transcription: {e}", exc_info=True)
            raise e


whisper_service = WhisperService()
