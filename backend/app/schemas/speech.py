from pydantic import BaseModel, Field
from typing import List, Optional


class TranscriptionSegment(BaseModel):
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")
    text: str = Field(..., description="Transcribed text segment")


class TranscriptionResponse(BaseModel):
    text: str = Field(..., description="Full transcribed text")
    language: str = Field(default="en", description="Detected or specified language")
    duration: float = Field(default=0.0, description="Audio duration in seconds")
    segments: List[TranscriptionSegment] = Field(default_factory=list, description="Word/phrase segment timestamps")


class SpeechHealthResponse(BaseModel):
    status: str
    whisper_available: bool
    whisper_model: str
    device: str
