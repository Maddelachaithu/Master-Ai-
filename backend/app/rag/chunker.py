import re
from typing import List, Dict, Any
from app.config import settings


class DocumentChunker:
    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.RAG_CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.RAG_CHUNK_OVERLAP

    def chunk_text(
        self,
        text: str,
        base_metadata: Dict[str, Any] = None,
        page_number: int = 1,
    ) -> List[Dict[str, Any]]:
        """
        Intelligently split text into semantic chunks while preserving markdown headers and paragraph boundaries.
        """
        base_meta = base_metadata or {}
        doc_id = base_meta.get("document_id", "doc")
        
        # Split text primarily by markdown headers or double newlines (paragraphs)
        sections = re.split(r"(?:\n\s*#{1,4}\s+.*|\n\n+)", text)
        clean_sections = [s.strip() for s in sections if s and s.strip()]

        chunks: List[Dict[str, Any]] = []
        current_chunk_parts: List[str] = []
        current_length = 0
        chunk_idx = 0

        for sec in clean_sections:
            sec_len = len(sec)

            if current_length + sec_len > self.chunk_size and current_chunk_parts:
                # Flush current chunk
                chunk_text = "\n\n".join(current_chunk_parts).strip()
                if len(chunk_text) > 30:
                    chunk_idx += 1
                    chunk_id = f"{doc_id}_p{page_number}_c{chunk_idx:03d}"
                    chunks.append({
                        "chunk_id": chunk_id,
                        "text": chunk_text,
                        "page": page_number,
                        "metadata": {
                            **base_meta,
                            "chunk_id": chunk_id,
                            "page": page_number,
                        },
                    })

                # Retain overlap from end of current chunk
                overlap_text = chunk_text[-self.chunk_overlap:] if len(chunk_text) > self.chunk_overlap else ""
                current_chunk_parts = [overlap_text, sec] if overlap_text else [sec]
                current_length = sum(len(p) for p in current_chunk_parts)
            else:
                current_chunk_parts.append(sec)
                current_length += sec_len

        # Final remaining chunk
        if current_chunk_parts:
            chunk_text = "\n\n".join(current_chunk_parts).strip()
            if len(chunk_text) > 30:
                chunk_idx += 1
                chunk_id = f"{doc_id}_p{page_number}_c{chunk_idx:03d}"
                chunks.append({
                    "chunk_id": chunk_id,
                    "text": chunk_text,
                    "page": page_number,
                    "metadata": {
                        **base_meta,
                        "chunk_id": chunk_id,
                        "page": page_number,
                    },
                })

        return chunks


chunker = DocumentChunker()
