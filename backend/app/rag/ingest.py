import sys
import logging
from typing import Dict, Any, List
from pathlib import Path
from app.config import settings
from app.rag.document_loader import document_loader
from app.rag.chunker import chunker
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("master_ai.rag.ingest")


def run_ingestion(force_reindex: bool = False, docs_dir: Path = None) -> Dict[str, Any]:
    """
    Execute full document ingestion pipeline with SHA-256 duplicate content prevention.
    """
    logger.info("=" * 60)
    logger.info("Starting MASTER AI RAG Knowledge Ingestion Pipeline")
    logger.info("=" * 60)

    target_dir = docs_dir or settings.DOCUMENTS_DIR
    documents = document_loader.scan_documents(target_dir)

    indexed_hashes = set() if force_reindex else vector_store.get_indexed_hashes()

    docs_discovered = len(documents)
    docs_processed = 0
    docs_skipped = 0
    total_chunks_created = 0
    total_chunks_indexed = 0

    all_chunk_ids: List[str] = []
    all_chunk_texts: List[str] = []
    all_chunk_metas: List[Dict[str, Any]] = []

    for doc in documents:
        content_hash = doc["content_hash"]

        if content_hash in indexed_hashes and not force_reindex:
            logger.info(f"Skipping unchanged document (SHA-256 match): {doc['document_name']}")
            docs_skipped += 1
            continue

        # If re-indexing an existing document ID, delete previous chunks first
        if doc["document_id"]:
            vector_store.delete_document(doc["document_id"])

        docs_processed += 1
        base_meta = {
            "document_id": doc["document_id"],
            "document_name": doc["document_name"],
            "source": doc["source"],
            "category": doc["category"],
            "topic": doc["topic"],
            "content_hash": doc["content_hash"],
        }

        # Chunk all pages of the document
        for page_data in doc["pages"]:
            page_chunks = chunker.chunk_text(
                text=page_data["text"],
                base_metadata=base_meta,
                page_number=page_data["page"],
            )

            for ch in page_chunks:
                all_chunk_ids.append(ch["chunk_id"])
                all_chunk_texts.append(ch["text"])
                all_chunk_metas.append(ch["metadata"])

    total_chunks_created = len(all_chunk_ids)

    # Batch embedding and indexing
    if total_chunks_created > 0:
        logger.info(f"Generating embeddings for {total_chunks_created} chunk(s)...")
        # Generate embeddings in batches of 64
        batch_size = 64
        all_embeddings: List[List[float]] = []

        for i in range(0, total_chunks_created, batch_size):
            batch_texts = all_chunk_texts[i : i + batch_size]
            embeddings = embedding_service.embed_texts(batch_texts)
            all_embeddings.extend(embeddings)

        # Upsert into ChromaDB
        indexed_count = vector_store.add_chunks(
            chunk_ids=all_chunk_ids,
            documents=all_chunk_texts,
            embeddings=all_embeddings,
            metadatas=all_chunk_metas,
        )
        total_chunks_indexed = indexed_count

    stats = vector_store.get_stats()

    summary = {
        "status": "success",
        "documents_discovered": docs_discovered,
        "documents_processed": docs_processed,
        "documents_skipped": docs_skipped,
        "chunks_created": total_chunks_created,
        "chunks_indexed": total_chunks_indexed,
        "total_vector_chunks_in_store": stats.get("total_chunks", 0),
        "unique_documents_in_store": stats.get("unique_documents", 0),
    }

    logger.info("=" * 60)
    logger.info(f"Ingestion Complete: {summary}")
    logger.info("=" * 60)
    return summary


if __name__ == "__main__":
    force = "--force" in sys.argv
    res = run_ingestion(force_reindex=force)
    print("\nIngestion Summary Results:")
    for k, v in res.items():
        print(f"  {k}: {v}")
