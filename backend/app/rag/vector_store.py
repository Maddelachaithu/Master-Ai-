import logging
from typing import List, Dict, Any, Optional, Set
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings

logger = logging.getLogger("master_ai.rag.vector_store")


class ChromaVectorStore:
    def __init__(self, persist_dir: str = None, collection_name: str = None):
        self.persist_dir = str(persist_dir or settings.CHROMA_PERSIST_DIR)
        self.collection_name = collection_name or settings.CHROMA_COLLECTION
        self._client = None
        self._collection = None

    def _get_collection(self):
        if self._collection is None:
            try:
                self._client = chromadb.PersistentClient(path=self.persist_dir)
                self._collection = self._client.get_or_create_collection(
                    name=self.collection_name,
                    metadata={"hnsw:space": "cosine"},
                )
                logger.info(f"Connected to ChromaDB collection '{self.collection_name}' at '{self.persist_dir}'")
            except Exception as e:
                logger.error(f"Error connecting to ChromaDB: {e}", exc_info=True)
                raise
        return self._collection

    def add_chunks(
        self,
        chunk_ids: List[str],
        documents: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict[str, Any]],
    ) -> int:
        if not chunk_ids:
            return 0

        coll = self._get_collection()

        # Sanitize metadata for ChromaDB (no lists or complex nested dicts allowed as direct values)
        clean_metadatas = []
        for m in metadatas:
            clean = {}
            for k, v in m.items():
                if isinstance(v, (str, int, float, bool)):
                    clean[k] = v
                elif isinstance(v, list):
                    clean[k] = ", ".join(str(x) for x in v)
                else:
                    clean[k] = str(v)
            clean_metadatas.append(clean)

        coll.upsert(
            ids=chunk_ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=clean_metadatas,
        )
        logger.info(f"Upserted {len(chunk_ids)} chunk(s) into ChromaDB collection '{self.collection_name}'")
        return len(chunk_ids)

    def query(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        where_filter: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        coll = self._get_collection()
        count = coll.count()
        if count == 0:
            return []

        actual_k = min(top_k, count)

        try:
            kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": actual_k,
                "include": ["documents", "metadatas", "distances"],
            }
            if where_filter:
                kwargs["where"] = where_filter

            results = coll.query(**kwargs)
        except Exception as e:
            logger.warning(f"Chroma query with filter failed ({e}), retrying without where filter.")
            kwargs.pop("where", None)
            results = coll.query(**kwargs)

        formatted = []
        if results and results["ids"] and len(results["ids"]) > 0:
            ids = results["ids"][0]
            docs = results["documents"][0] if "documents" in results else []
            metas = results["metadatas"][0] if "metadatas" in results else []
            dists = results["distances"][0] if "distances" in results else []

            for idx in range(len(ids)):
                dist = dists[idx] if idx < len(dists) else 0.5
                # Convert cosine distance to cosine similarity: sim = 1 - dist
                similarity = max(0.0, min(1.0, 1.0 - (dist / 2.0) if dist <= 2.0 else 0.0))
                formatted.append({
                    "chunk_id": ids[idx],
                    "content": docs[idx] if idx < len(docs) else "",
                    "metadata": metas[idx] if idx < len(metas) else {},
                    "similarity_score": round(similarity, 4),
                })

        return formatted

    def get_indexed_hashes(self) -> Set[str]:
        """Retrieve set of unique content hashes already present in ChromaDB."""
        coll = self._get_collection()
        try:
            all_meta = coll.get(include=["metadatas"])
            hashes = set()
            if all_meta and "metadatas" in all_meta and all_meta["metadatas"]:
                for m in all_meta["metadatas"]:
                    if m and "content_hash" in m:
                        hashes.add(m["content_hash"])
            return hashes
        except Exception as e:
            logger.error(f"Error reading indexed hashes: {e}")
            return set()

    def get_stats(self) -> Dict[str, Any]:
        try:
            coll = self._get_collection()
            count = coll.count()
            hashes = self.get_indexed_hashes()
            return {
                "collection_name": self.collection_name,
                "total_chunks": count,
                "unique_documents": len(hashes),
                "persist_directory": self.persist_dir,
                "status": "ready" if count > 0 else "empty",
            }
        except Exception as e:
            return {
                "collection_name": self.collection_name,
                "total_chunks": 0,
                "unique_documents": 0,
                "status": f"error: {e}",
            }

    def delete_document(self, document_id: str) -> int:
        coll = self._get_collection()
        try:
            coll.delete(where={"document_id": document_id})
            logger.info(f"Deleted chunks for document {document_id}")
            return 1
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {e}")
            return 0

    def is_ready(self) -> bool:
        try:
            coll = self._get_collection()
            return coll is not None
        except Exception:
            return False


vector_store = ChromaVectorStore()
chroma_store = vector_store
