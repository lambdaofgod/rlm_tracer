from __future__ import annotations

import hashlib
import json
import logging
from datetime import datetime
from pathlib import Path

from src.pipeline.models import Record
from src.pipeline.repository import LogRepository

logger = logging.getLogger(__name__)


class JsonlFileRepository(LogRepository):
    def __init__(self, path: str, glob: str) -> None:
        self._path = Path(path)
        self._glob = glob

    def discover_unprocessed(self, processed: set[str]) -> list[str]:
        return [p.name for p in self._path.glob(self._glob) if p.name not in processed]

    def is_complete(self, source_id: str) -> bool:
        filepath = self._path / source_id
        try:
            text = filepath.read_text()
        except OSError:
            return False
        for line in reversed(text.splitlines()):
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                return False
            return entry.get("final_answer") is not None
        return False

    def read(self, source_id: str) -> list[Record]:
        filepath = self._path / source_id
        records: list[Record] = []
        for lineno, raw_line in enumerate(filepath.read_text().splitlines(), 1):
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                entry = json.loads(raw_line)
            except json.JSONDecodeError:
                logger.warning("%s:%d: unparseable line, skipping", source_id, lineno)
                continue

            entry_type = entry.get("type")
            if entry_type not in ("initial_prompt", "iteration"):
                continue

            text = self._extract_text(entry, entry_type)
            if not text:
                continue

            iteration = entry.get("iteration", 0)
            idx = entry.get("idx_in_iteration", 0)
            record_id = hashlib.sha256(
                f"{source_id}:{iteration}:{idx}".encode()
            ).hexdigest()

            records.append(
                Record(
                    id=record_id,
                    timestamp=datetime.fromisoformat(entry["timestamp"]),
                    filename=source_id,
                    text=text,
                    iteration=iteration,
                    idx_in_iteration=idx,
                    type=entry_type,
                )
            )
        return records

    @staticmethod
    def _extract_text(entry: dict, entry_type: str) -> str:
        if entry_type == "initial_prompt":
            prompt = entry.get("prompt", [])
            parts = [
                msg["content"]
                for msg in prompt
                if isinstance(msg, dict) and msg.get("role") == "user"
            ]
            return "\n".join(parts)
        if entry_type == "iteration":
            return entry.get("response", "")
        return ""
