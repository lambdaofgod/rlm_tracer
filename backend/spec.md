# Log Embedding Visualizer -- Backend Specification

## 1. Purpose

Process LLM agent run logs into an embedding visualization dataset for Embedding Atlas.

## 2. Ingestion

### Log Repository

The system ingests log data through a pluggable repository interface. Each
repository handles a specific storage backend and implements the following
contract:

    class LogRepository(Protocol):

        def discover_unprocessed(self, processed: set[str]) -> list[str]:
            """Find source IDs not yet processed."""
            ...

        def is_complete(self, source_id: str) -> bool:
            """Return True when the source is finished and ready for indexing."""
            ...

        def read(self, source_id: str) -> list[Record]:
            """Parse the entire source into Record objects (called once per source)."""
            ...

A `Record` is the common output format for all repositories (see Data Model).

### Behavior

- When the system checks for new data, it should ask the repository for
  unprocessed sources.
- When a source is complete, the system should parse it in one pass and hand
  the records to the pipeline.
- When a source is not yet complete, the system should skip it and retry on
  the next check.
- When a source has already been processed, the system should skip it.
- When the system restarts, it should know which sources were already
  processed and skip them.

### Triggering

The system supports configurable triggers that decide *when* to check for
new data:

- **Polling**: check at a regular interval.
- **Event-driven**: react to external signals (e.g. filesystem events).

Both trigger modes use the same repository interface.

## 3. Embedding

- When new records are parsed, the system should generate vector embeddings
  for each record's text field.
- When the embedding service is unavailable, the system should retry with
  backoff.
- When a record fails to embed after retries, the system should log the
  error and skip that record.

## 4. Projection

- When embeddings are generated for the first batch, the system should fit a
  dimensionality reduction model and project all vectors to 2D.
- When new embeddings arrive after the initial fit, the system should project
  them using the existing model.
- When a recompute is requested via the API, the system should refit the
  model on all stored embeddings and update all projections.
- When a recompute is requested during active ingestion, the system should
  queue it until the current batch completes.

## 5. Output

- When a batch is processed, the system should atomically update the output
  files so readers always see consistent data.
- When the output is read by Atlas, it should contain all metadata, text, and
  2D projections needed for visualization.

## 6. API

- `GET /health` -- return status indicating if the pipeline is running.
- `POST /recompute-projection` -- trigger projection refit, return record count.

## 7. Data Model

### 7.1 Record (repository output)

| Field              | Type       | Description                       |
|--------------------|------------|-----------------------------------|
| id                 | string     | Deterministic, content-derived    |
| timestamp          | datetime   | When the log entry occurred       |
| filename           | string     | Source identifier                 |
| text               | string     | Content to embed                  |
| iteration          | int        | Iteration number in the agent run |
| idx_in_iteration   | int        | Index within the iteration        |
| type               | string     | Record classification             |

### 7.2 Logs Output (Atlas input)

| Column             | Type        |
|--------------------|-------------|
| id                 | string      |
| timestamp          | timestamp   |
| filename           | string      |
| text               | string      |
| iteration          | int32       |
| idx_in_iteration   | int32       |
| type               | string      |
| projection_x       | float32     |
| projection_y       | float32     |

### 7.3 Embeddings Output

| Column   | Type              |
|----------|-------------------|
| id       | string            |
| vector   | list<float32>     |

### 7.4 State

The system persists:

- Which sources have been processed (to avoid reprocessing on restart).
- Pipeline counters (total records, projection fit state).

## 8. System Overview

    Sources --> [Repository] --> Records --> [Embedder] --> Vectors
                                                             |
                                                             v
                                               [Projector] --> 2D coords
                                                             |
                                                             v
                                                       Output files

    [Trigger] periodically or on events invokes the repository.
    API server provides health check and recompute trigger.
