from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> str:
        pass

    @abstractmethod
    async def generate_stream(self, messages: List[Dict[str, str]], temperature: float = 0.2) -> AsyncGenerator[str, None]:
        pass
