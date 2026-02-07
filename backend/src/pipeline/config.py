from __future__ import annotations

from pathlib import Path

import yaml
from pydantic import BaseModel


class SourceConfig(BaseModel):
    path: str
    repository: str
    glob: str


class TriggerConfig(BaseModel):
    mode: str
    poll_interval_seconds: int = 10
    debounce_seconds: int = 2


class IngestionConfig(BaseModel):
    sources: list[SourceConfig]
    trigger: TriggerConfig


class EmbeddingConfig(BaseModel):
    url: str
    dimension: int = 384
    batch_size: int = 128
    max_retries: int = 3


class ProjectionConfig(BaseModel):
    refit_threshold: float = 2.0


class OutputConfig(BaseModel):
    parquet_path: str
    embeddings_path: str
    state_db_path: str


class ApiConfig(BaseModel):
    host: str = "0.0.0.0"
    port: int = 8000


class Config(BaseModel):
    ingestion: IngestionConfig
    embedding: EmbeddingConfig
    projection: ProjectionConfig
    output: OutputConfig
    api: ApiConfig


def load_config(path: str | Path) -> Config:
    with open(path) as f:
        raw = yaml.safe_load(f)
    return Config.model_validate(raw)
