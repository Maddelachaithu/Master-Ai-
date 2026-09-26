import os
import json
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("master_ai.llm")


class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL
        self.base_url = settings.LLM_BASE_URL

    def is_configured(self) -> bool:
        return bool(self.api_key and self.provider)

    def is_available(self) -> bool:
        return self.is_configured()

    async def generate_json(
        self,
        prompt_or_system: str,
        user_prompt: Optional[str] = None,
        system_instruction: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Generate structured JSON output from the configured LLM provider.
        Supports OpenAI, Anthropic, Gemini, or custom OpenAI-compatible endpoints.
        """
        if not self.is_configured():
            logger.debug("LLM provider not configured or no API key provided. Using built-in reasoning engine.")
            return None

        if user_prompt is not None:
            system_prompt = prompt_or_system
            actual_user_prompt = user_prompt
        else:
            system_prompt = system_instruction or "You are MASTER AI. Return only valid JSON."
            actual_user_prompt = prompt_or_system

        try:
            if self.provider in ["openai", "azure", "custom"]:
                return await self._call_openai(system_prompt, user_prompt)
            elif self.provider in ["anthropic", "claude"]:
                return await self._call_anthropic(system_prompt, user_prompt)
            elif self.provider in ["gemini", "google"]:
                return await self._call_gemini(system_prompt, user_prompt)
            else:
                logger.warning(f"Unsupported LLM provider: {self.provider}")
                return None
        except Exception as e:
            logger.error(f"Error calling LLM provider {self.provider}: {e}", exc_info=True)
            return None

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url if self.base_url else None,
        )

        response = await client.chat.completions.create(
            model=self.model or "gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.2,
        )

        content = response.choices[0].message.content
        return json.loads(content or "{}")

    async def _call_anthropic(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        import httpx

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }
        payload = {
            "model": self.model or "claude-3-5-sonnet-20241022",
            "max_tokens": 1500,
            "system": system_prompt + "\nYou MUST return only valid JSON.",
            "messages": [{"role": "user", "content": user_prompt}],
            "temperature": 0.2,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text_content = data["content"][0]["text"]
            # Extract JSON from code fences if present
            if "```json" in text_content:
                text_content = text_content.split("```json")[1].split("```")[0].strip()
            elif "```" in text_content:
                text_content = text_content.split("```")[1].split("```")[0].strip()
            return json.loads(text_content)

    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        import httpx

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model or 'gemini-1.5-flash'}:generateContent?key={self.api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"System Instructions:\n{system_prompt}\n\nTask:\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2,
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)


llm_service = LLMService()
