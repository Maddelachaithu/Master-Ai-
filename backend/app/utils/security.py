import os
import re
from pathlib import Path
from typing import Tuple, Set

ALLOWED_RESUME_EXTENSIONS: Set[str] = {".pdf", ".txt", ".md"}
ALLOWED_DOCUMENT_EXTENSIONS: Set[str] = {".pdf", ".txt", ".md"}


def sanitize_filename(filename: str) -> str:
    """
    Sanitizes filenames to prevent path traversal attacks (e.g. ../../).
    Strips directory separators and non-whitelisted characters.
    """
    # Extract only base name
    base_name = os.path.basename(filename)
    # Remove null bytes
    base_name = base_name.replace("\x00", "")
    # Remove path traversal tokens
    base_name = re.sub(r"\.\.+", ".", base_name)
    # Allow alphanumeric, underscore, hyphen, and dot
    clean_name = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", base_name)
    return clean_name or "uploaded_document.txt"


def validate_file_upload(
    file_bytes: bytes,
    filename: str,
    max_mb: int = 10,
    allowed_extensions: Set[str] = ALLOWED_RESUME_EXTENSIONS,
) -> Tuple[bool, str]:
    """
    Validates uploaded file size and extension to reject executables and oversized payloads.
    """
    max_bytes = max_mb * 1024 * 1024
    if len(file_bytes) > max_bytes:
        return False, f"File size ({len(file_bytes) / 1024 / 1024:.1f}MB) exceeds maximum allowed {max_mb}MB limit."

    if len(file_bytes) == 0:
        return False, "File is empty."

    ext = Path(filename).suffix.lower()
    if ext not in allowed_extensions:
        return False, f"File extension '{ext}' is not permitted. Allowed extensions: {', '.join(sorted(allowed_extensions))}."

    return True, "Valid"


def wrap_untrusted_candidate_input(text: str) -> str:
    """
    Wraps candidate answers or resumes with clear boundary tags to defend against prompt injection.
    Agents must treat content between these tags as data, never as system-level instructions.
    """
    cleaned = text.replace("<candidate_untrusted_input>", "").replace("</candidate_untrusted_input>", "")
    return f"<candidate_untrusted_input>\n{cleaned}\n</candidate_untrusted_input>"


def wrap_untrusted_rag_evidence(text: str) -> str:
    """
    Wraps retrieved RAG evidence passages with clear boundary tags to defend against prompt injection in documents.
    """
    cleaned = text.replace("<retrieved_evidence>", "").replace("</retrieved_evidence>", "")
    return f"<retrieved_evidence>\n{cleaned}\n</retrieved_evidence>"
