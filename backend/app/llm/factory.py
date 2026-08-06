import httpx
from openai import AsyncOpenAI
from typing import List, Dict, AsyncGenerator
from app.config import get_settings
from app.llm.base import BaseLLMProvider

class OpenAILikeProvider(BaseLLMProvider):
    def __init__(self, api_key: str, base_url: str, model: str):
        self.model = model
        self.client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=httpx.Timeout(connect=30.0, read=60.0, write=30.0, pool=10.0),
            max_retries=0
        )

    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> str:
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            top_p=0.95,
            max_tokens=8192,
            stream=False,
        )
        return response.choices[0].message.content or ""

    async def generate_stream(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> AsyncGenerator[str, None]:
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature,
            top_p=0.95,
            max_tokens=8192,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

def get_llm_provider(provider_name: str = None) -> BaseLLMProvider:
    settings = get_settings()
    
    if provider_name is None:
        if settings.NVIDIA_API_KEY:
            provider_name = "nvidia"
        else:
            provider_name = "openai"
            
    if provider_name == "nvidia":
        return OpenAILikeProvider(
            api_key=settings.NVIDIA_API_KEY,
            base_url=settings.NVIDIA_BASE_URL,
            model=settings.NVIDIA_MODEL
        )
    elif provider_name == "openai":
        return OpenAILikeProvider(
            api_key=settings.OPENAI_API_KEY,
            base_url="https://api.openai.com/v1",
            model="gpt-4o-mini"
        )
    else:
        raise ValueError(f"Unknown provider: {provider_name}")
