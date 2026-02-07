# Log Embedding Visualizer -- Implementation Stack

## Technology Choices

| Concern              | Choice                                                               |
|----------------------|----------------------------------------------------------------------|
| Language             | Python 3.10+                                                        |
| Package manager      | uv                                                                  |
| Embedding service    | Weaviate text2vec-transformers (all-MiniLM-L6-v2-onnx)              |
| Projection           | scikit-learn PCA (n_components=2)                                   |
| Output format        | Parquet via PyArrow                                                 |
| State persistence    | SQLite (WAL mode)                                                   |
| HTTP API             | FastAPI + Uvicorn                                                   |
| Deployment           | Docker Compose                                                      |
| Config format        | YAML (PyYAML)                                                       |
| Data validation      | Pydantic                                                            |

## Configuration

```yaml
ingestion:
  sources:
    - path: /data/logs
      repository: jsonl
      glob: "*.jsonl"
  trigger:
    mode: poll            # "poll" or "watchdog"
    poll_interval_seconds: 10
    debounce_seconds: 2   # watchdog mode only

embedding:
  url: http://text2vec:8080
  dimension: 384
  batch_size: 128
  max_retries: 3

projection:
  refit_threshold: 2.0

output:
  parquet_path: /data/output/logs.parquet
  embeddings_path: /data/output/embeddings.parquet
  state_db_path: /data/output/state.db

api:
  host: 0.0.0.0
  port: 8000
```

## JSONL Repository

The built-in JSONL repository handles `.jsonl` log files from LLM agent runs.

### Completeness Check

A JSONL file is complete when its last non-empty line is a JSON object with
`"final_answer"` set to a non-null value.

### Parsing Logic

1. Read all lines from the file.
2. JSON-decode each line. Skip unparseable lines with a warning.
3. Skip entries where type is not `"initial_prompt"` or `"iteration"`.
4. Extract text:
   - `initial_prompt`: join user-role message contents from the prompt array.
   - `iteration`: use the response field.
5. Skip entries with no extractable text.

### Entry Types

| type            | Text source                    | iteration  | idx_in_iteration |
|-----------------|--------------------------------|------------|------------------|
| metadata        | (skipped)                      | --         | --               |
| initial_prompt  | prompt[role=user].content      | 0          | 0                |
| iteration       | response field                 | from entry | 0                |

## Implementation Details

### Record ID Generation

    id = sha256(filename + ":" + str(iteration) + ":" + str(idx_in_iteration))

Deterministic so re-processing produces the same IDs.

### Atomic Writes

Write to temp file, then `os.rename()`. Readers always see complete files.

### Embedding API

    POST http://text2vec:8080/vectors
    Body: {"text": "..."}
    Response: vector array

### PCA Refit Trigger

Automatic refit when `total_records >= records_at_last_pca_fit * refit_threshold`.
Model persisted to `pca_model.pkl`.

### Source Polling

1. Every `poll_interval_seconds`, scan each configured source path with its glob.
2. Compare discovered sources against `processed_sources` in SQLite.
3. For unprocessed sources, call `is_complete()` via the repository.
4. If complete, `read()` and pass records to the pipeline. Mark as processed.

### Watchdog Trigger

When `trigger.mode` is `"watchdog"`:

1. Use `watchdog` to monitor each source path for file changes.
2. Debounce: wait until file size is unchanged for `debounce_seconds`.
3. On stable file, call `is_complete()` and proceed as above.

## State Database Schema

```sql
CREATE TABLE processed_sources (
    source_id TEXT PRIMARY KEY,
    processed_at TEXT NOT NULL
);

CREATE TABLE pipeline_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
```

Keys in `pipeline_state`: `total_records`, `records_at_last_pca_fit`, `pca_fitted`.

## Docker Compose Services

| Service    | Image                                                                                 | Ports             | Volumes                                |
|------------|---------------------------------------------------------------------------------------|-------------------|----------------------------------------|
| text2vec   | semitechnologies/transformers-inference:sentence-transformers-all-MiniLM-L6-v2-onnx   | 8080 (internal)   | --                                     |
| pipeline   | Custom (this project)                                                                 | 8000:8000         | /data/logs (ro), /data/output (rw)     |

## Error Handling

| Failure                           | Behavior                                       |
|-----------------------------------|-------------------------------------------------|
| text2vec unavailable              | Retry with exponential backoff, block pipeline  |
| Unparseable line in JSONL         | Log warning, skip line                          |
| Repository exception              | Log error, skip source                          |
| Disk full                         | Log critical, stop pipeline                     |
| Recompute during active ingestion | Queue until batch completes                     |
| Source never becomes complete      | Stays unprocessed, retried on each poll         |
