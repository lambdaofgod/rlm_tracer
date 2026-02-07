# Backend Implementation Tasks

## 1. Project scaffolding
- [x] Init Python project with `uv init` inside `backend/`
- [x] Add dependencies: `fastapi`, `uvicorn`, `watchdog`, `scikit-learn`, `pyarrow`, `httpx`, `pyyaml`
- [x] Create package structure: `backend/src/pipeline/` with `__init__.py`
- [x] Create `backend/config.yaml` with defaults from stack.md

## 2. Configuration
- [x] Create `config.py` with Pydantic models
- [x] `IngestionConfig`: list of `SourceConfig` (path, repository, glob) + `TriggerConfig` (mode, poll_interval, debounce)
- [x] `EmbeddingConfig`, `ProjectionConfig`, `OutputConfig`, `ApiConfig` unchanged
- [x] `load_config()` reads `config.yaml`

## 3. Record model
- [x] Create `models.py` with `Record` Pydantic model
- [x] Fields: id, timestamp, filename, text, iteration, idx_in_iteration, type

## 4. LogRepository abstract class
- [x] Create `repository.py` with `LogRepository` ABC
- [x] `discover_unprocessed(processed: set[str]) -> list[str]`
- [x] `is_complete(source_id: str) -> bool`
- [x] `read(source_id: str) -> list[Record]`

## 5. JSONL repository
- [x] Create `jsonl_repository.py` implementing `LogRepository`
- [x] `discover_unprocessed`: glob directory, filter out already-processed IDs
- [x] `is_complete`: last non-empty line has non-null `final_answer`
- [x] `read`: parse all lines, extract text per entry type (see stack.md)
- [x] ID generation: `sha256(filename:iteration:idx_in_iteration)`
- [x] Skip and log unparseable lines

## 6. Set up linting and formatting
- [x] Add `black` as a dev dependency
- [x] Run `black` on all existing source files
- [x] Verify all files pass `black --check`
- [x] Add `pyrefly` as a dev dependency
- [x] Create `Makefile` with `check-and-format-py` target (pyrefly then black)
- [x] Verify pyrefly catches the `datetme` typo in `models.py`
- [x] Fix the typo, verify clean pass
- [x] Set up `pre-commit` with pyrefly + black hooks

## 7. State persistence (SQLite)
- [ ] Create `state.py`
- [ ] `processed_sources` table: track which sources have been processed
- [ ] `pipeline_state` table: track `total_records`, `records_at_last_pca_fit`, `pca_fitted`
- [ ] Methods: `is_processed()`, `mark_processed()`, `get_processed_set()`, `get_state()`, `set_state()`
- [ ] Init DB and create tables on first run

## 8. Embedding client
- [ ] Create `embedder.py`
- [ ] `embed_batch(texts: list[str]) -> list[list[float]]`
- [ ] POST to text2vec endpoint (see stack.md)
- [ ] Batch by `config.embedding.batch_size`
- [ ] Retry with exponential backoff up to `max_retries`
- [ ] On permanent failure for a record: log error, skip record

## 9. PCA projection
- [ ] Create `projector.py`
- [ ] `fit_and_transform(vectors) -> (x, y)` - fit PCA, persist model, return 2D coords
- [ ] `transform(vectors) -> (x, y)` - transform using existing model
- [ ] `refit_all(all_vectors) -> list[(x, y)]` - refit on all vectors, update all projections
- [ ] Auto-refit trigger: when `total_records >= records_at_last_pca_fit * refit_threshold`

## 10. Parquet output
- [ ] Create `output.py`
- [ ] `write_logs_parquet(records_with_projections, path)` - schema from spec 7.2
- [ ] `write_embeddings_parquet(ids, vectors, path)` - schema from spec 7.3
- [ ] Atomic writes: write to temp file, then `os.rename()`
- [ ] Merge with existing parquet data on append

## 11. Trigger (source discovery)
- [ ] Create `trigger.py`
- [ ] Poll mode: periodically call `repository.discover_unprocessed()` at configured interval
- [ ] Watchdog mode: use `watchdog` to monitor source paths, debounce, then call `discover_unprocessed()`
- [ ] Emit discovered complete sources to pipeline

## 12. Pipeline orchestration
- [ ] Create `pipeline.py`
- [ ] Receive complete source IDs from trigger
- [ ] For each source:
  1. `repository.read(source_id)` - get all records
  2. Embed texts
  3. Project embeddings (fit on first batch, transform on subsequent)
  4. Write output parquets atomically
  5. `state.mark_processed(source_id)`
- [ ] Queue recompute requests if batch is in progress

## 13. FastAPI API
- [ ] Create `api.py`
- [ ] `GET /health` - return `{"status": "ok", "pipeline_running": bool}`
- [ ] `POST /recompute-projection` - trigger PCA refit, return `{"status": "ok", "record_count": int}`
- [ ] If recompute requested during ingestion: queue until batch completes

## 14. Application entrypoint
- [ ] Create `main.py`
- [ ] Load config
- [ ] Init state DB
- [ ] Instantiate repository from config
- [ ] Start trigger (poll or watchdog)
- [ ] Start pipeline in background
- [ ] Start FastAPI server

## 15. Docker Compose
- [ ] Create `Dockerfile` for the pipeline service
- [ ] Create `docker-compose.yml` (see stack.md for services)

## 16. Error handling review
- [ ] Verify all error behaviors from stack.md error table
