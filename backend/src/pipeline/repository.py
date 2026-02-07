from __future__ import annotations

from abc import ABC, abstractmethod

from src.pipeline.models import Record


class LogRepository(ABC):
    @abstractmethod
    def discover_unprocessed(self, processed: set[str]) -> list[str]: ...

    @abstractmethod
    def is_complete(self, source_id: str) -> bool: ...

    @abstractmethod
    def read(self, source_id: str) -> list[Record]: ...
