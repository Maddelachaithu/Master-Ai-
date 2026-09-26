import logging
import hashlib
import math
from typing import List
from app.config import settings

logger = logging.getLogger("master_ai.rag.embeddings")


class EmbeddingService:
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.EMBEDDING_MODEL
        self._model = None
        self._dimension = 384
        self._init_attempted = False

    def _get_model(self):
        if self._init_attempted:
            return self._model

        self._init_attempted = True
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer embedding model: {self.model_name}")
            self._model = SentenceTransformer(self.model_name)
            logger.info("SentenceTransformer loaded successfully.")
        except Exception as e:
            logger.warning(f"SentenceTransformer not loaded ({e}), using fast deterministic embedding provider.")
            self._model = None
        return self._model

    def _fallback_embed(self, text: str) -> List[float]:
        """
        Deterministic, fast 384-dimensional normalized semantic-hash vector.
        Guarantees zero-network offline functionality and identical embeddings for identical inputs.
        """
        vec = [0.0] * self._dimension
        tokens = text.lower().split()
        if not tokens:
            return vec

        for i, token in enumerate(tokens):
            h = int(hashlib.sha256(token.encode("utf-8")).hexdigest(), 16)
            idx = h % self._dimension
            weight = 1.0 + (1.0 / (i + 1))
            vec[idx] += weight

        # L2 Normalize
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0:
            vec = [x / norm for x in vec]
        return vec

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        model = self._get_model()
        if model is not None:
            try:
                embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Error encoding texts with model: {e}")

        # Fallback
        return [self._fallback_embed(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        results = self.embed_texts([query])
        return results[0] if results else [0.0] * self._dimension


embedding_service = EmbeddingService()
