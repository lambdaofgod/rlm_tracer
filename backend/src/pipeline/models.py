from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class Record(BaseModel):
    id: str
    timestamp: datetime
    filename: str
    text: str
    iteration: int
    idx_in_iteration: int
    type: str
