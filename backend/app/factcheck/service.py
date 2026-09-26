import re
import logging
from typing import List, Dict, Optional
from app.factcheck.provider import FactCheckProvider, FactCheckResult
from app.factcheck.providers.mock_provider import MockFactCheckProvider
from app.factcheck.providers.web_provider import WebFactCheckProvider
from app.config import settings

logger = logging.getLogger("master_ai.factcheck.service")


class FactCheckService:
    def __init__(self):
        # Select provider based on configuration
        if settings.FACT_CHECK_PROVIDER == "web":
            self.provider: FactCheckProvider = WebFactCheckProvider()
        else:
            self.provider: FactCheckProvider = MockFactCheckProvider()

        # Bounded LRU-style in-memory cache: normalized claim -> FactCheckResult
        self._cache: Dict[str, FactCheckResult] = {}
        self._max_cache_size = 500

    def _normalize_claim_key(self, claim: str) -> str:
        """Strip punctuation and lowercase for robust cache matching."""
        clean = re.sub(r"[^\w\s]", "", claim.lower())
        return " ".join(clean.split())

    def extract_technical_claims(self, answer_text: str, max_claims: Optional[int] = None) -> List[str]:
        """
        Extract key technical assertions from the candidate's answer.
        Focuses on verifiable claims (Event IDs, protocols, tools, memory locations, RFCs, CVEs).
        Enforces MAX_CLAIMS_PER_ANSWER bound.
        """
        if not answer_text.strip():
            return []

        limit = max_claims or settings.MAX_CLAIMS_PER_ANSWER
        claims: List[str] = []

        # Technical pattern matchers
        patterns = [
            (r"(event\s*id\s*\d+)", "Windows Event ID telemetry assertion"),
            (r"(kerberos|tgt|tgs|pass-the-ticket|golden ticket|silver ticket)", "Kerberos credential delegation claim"),
            (r"(lsass|minidump|mimikatz|sysmon\s*event\s*10)", "LSASS memory access and process dumping claim"),
            (r"(169\.254\.169\.254|imds|imds.*v2)", "Cloud instance metadata SSRF mitigation claim"),
            (r"(rfc\s*\d+|10\.0\.0\.0|192\.168\.|172\.16\.)", "Network address space definition"),
            (r"(firewall.*(alone|sufficient|stops|prevents))", "Perimeter security effectiveness claim"),
            (r"(zgc|colored\s*pointer|load\s*barrier)", "Garbage collection pause time claim"),
            (r"(token\s*bucket|sliding\s*window|redis\s*cluster)", "Rate limiting architecture claim"),
        ]

        # Extract sentences that match technical patterns
        sentences = re.split(r"[.!?\n]+", answer_text)
        for sentence in sentences:
            sentence_clean = sentence.strip()
            if len(sentence_clean) < 10:
                continue

            for pattern, _ in patterns:
                if re.search(pattern, sentence_clean, re.IGNORECASE):
                    if sentence_clean not in claims:
                        claims.append(sentence_clean)
                    break

            if len(claims) >= limit:
                break

        # Fallback: if no specific regex matched but answer is substantial, use first declarative statement
        if not claims and len(sentences) > 0 and len(sentences[0].strip()) > 15:
            claims.append(sentences[0].strip())

        return claims[:limit]

    async def verify_claim(self, claim: str) -> FactCheckResult:
        key = self._normalize_claim_key(claim)

        # Check cache
        if key in self._cache:
            cached = self._cache[key]
            logger.debug(f"Fact check cache hit for '{key}'")
            return FactCheckResult(
                claim=cached.claim,
                verdict=cached.verdict,
                confidence=cached.confidence,
                sources=cached.sources,
                explanation=cached.explanation,
                cached=True,
            )

        # Verify via provider
        result = await self.provider.verify_claim(claim)

        # Store in bounded cache
        if len(self._cache) >= self._max_cache_size:
            # Drop oldest key
            oldest_key = next(iter(self._cache))
            del self._cache[oldest_key]

        self._cache[key] = result
        return result

    async def verify_claims_batch(self, claims: List[str]) -> List[FactCheckResult]:
        results: List[FactCheckResult] = []
        for claim in claims:
            res = await self.verify_claim(claim)
            results.append(res)
        return results


fact_check_service = FactCheckService()
