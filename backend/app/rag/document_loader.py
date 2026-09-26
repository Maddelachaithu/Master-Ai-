import os
import hashlib
import logging
from pathlib import Path
from typing import List, Dict, Any
from app.config import settings

logger = logging.getLogger("master_ai.rag.loader")


class DocumentLoader:
    SUPPORTED_EXTENSIONS = {".md", ".txt", ".pdf"}

    def __init__(self, root_dir: Path = None):
        self.root_dir = root_dir or settings.DOCUMENTS_DIR

    @staticmethod
    def compute_sha256(content_bytes: bytes) -> str:
        return hashlib.sha256(content_bytes).hexdigest()

    def load_pdf(self, file_path: Path) -> List[Dict[str, Any]]:
        """Extract text from PDF page by page using pypdf."""
        pages_data = []
        try:
            import pypdf
            reader = pypdf.PdfReader(str(file_path))
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages_data.append({
                        "page": page_idx + 1,
                        "text": text.strip(),
                    })
        except Exception as e:
            logger.error(f"Error reading PDF {file_path}: {e}")
        return pages_data

    def load_text_or_markdown(self, file_path: Path) -> List[Dict[str, Any]]:
        """Read standard UTF-8 text or markdown file."""
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            return [{"page": 1, "text": text.strip()}]
        except Exception as e:
            logger.error(f"Error reading file {file_path}: {e}")
            return []

    def scan_documents(self, specific_dir: Path = None) -> List[Dict[str, Any]]:
        """
        Recursively scan directories for technical documents.
        Returns document metadata and raw page contents.
        """
        target_dir = specific_dir or self.root_dir
        if not target_dir.exists():
            target_dir.mkdir(parents=True, exist_ok=True)
            return []

        documents: List[Dict[str, Any]] = []

        for root, _, files in os.walk(target_dir):
            for file in files:
                ext = Path(file).suffix.lower()
                if ext not in self.SUPPORTED_EXTENSIONS:
                    continue

                full_path = Path(root) / file
                rel_path = full_path.relative_to(target_dir)
                
                # Derive category and topic from directory structure
                parts = rel_path.parts
                category = parts[0] if len(parts) > 1 else "general"
                topic = parts[1] if len(parts) > 2 else Path(file).stem.replace("_", " ")

                try:
                    with open(full_path, "rb") as f:
                        raw_bytes = f.read()
                    content_hash = self.compute_sha256(raw_bytes)

                    if ext == ".pdf":
                        pages = self.load_pdf(full_path)
                    else:
                        pages = self.load_text_or_markdown(full_path)

                    if pages:
                        doc_id = f"doc_{content_hash[:12]}"
                        doc_name = Path(file).stem.replace("_", " ").title()
                        documents.append({
                            "document_id": doc_id,
                            "document_name": doc_name,
                            "file_path": str(full_path),
                            "category": category,
                            "topic": topic,
                            "source": f"Master AI Knowledge Base / {category} / {file}",
                            "content_hash": content_hash,
                            "pages": pages,
                        })
                except Exception as e:
                    logger.error(f"Failed to scan document {full_path}: {e}")

        logger.info(f"Discovered {len(documents)} document(s) in {target_dir}")
        return documents


document_loader = DocumentLoader()
