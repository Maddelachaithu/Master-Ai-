import re
import logging
from typing import List
from app.rag.metadata import RagRetrievalResult

logger = logging.getLogger("master_ai.rag.reranker")


class LightweightReranker:
    """
    Reranks retrieved candidate chunks based on technical identifier matching,
    query-topic alignment, and official documentation authority.
    """

    TECHNICAL_TOKENS = [
        r"\bevent\s*id\s*\d+\b",
        r"\brfc\s*\d+\b",
        r"\bcve-\d{4}-\d+\b",
        r"\bt\d{4}(?:\.\d{3})?\b",  # MITRE ATT&CK technique IDs
        r"\bimdsv\d\b",
        r"\bkerberos\b",
        r"\blsass\b",
        r"\bowasp\b",
        r"\bzero\s*trust\b",
    ]

    AUTHORITY_KEYWORDS = ["nist", "microsoft", "aws", "owasp", "mitre", "rfc", "ietf", "cis"]

    def rerank(self, query: str, results: List[RagRetrievalResult], top_k: int = 4) -> List[RagRetrievalResult]:
        if not results:
            return []

        query_lower = query.lower()

        # Find technical patterns in query
        query_tech_matches = []
        for pat in self.TECHNICAL_TOKENS:
            m = re.findall(pat, query_lower)
            if m:
                query_tech_matches.extend(m)

        reranked = []
        for res in results:
            content_lower = res.content.lower()
            doc_lower = res.document_name.lower()
            source_lower = res.source.lower()

            bonus = 0.0

            # 1. Technical identifier exact match bonus
            for tech_tok in query_tech_matches:
                if tech_tok in content_lower:
                    bonus += 0.15

            # 2. Authority source bonus
            if any(auth in source_lower or auth in doc_lower for auth in self.AUTHORITY_KEYWORDS):
                bonus += 0.08

            # 3. Topic overlap
            if res.topic.lower() in query_lower:
                bonus += 0.07

            final_score = min(1.0, res.similarity_score + bonus)
            res.similarity_score = round(final_score, 4)
            reranked.append(res)

        reranked.sort(key=lambda x: x.similarity_score, reverse=True)
        return reranked[:top_k]


reranker = LightweightReranker()
