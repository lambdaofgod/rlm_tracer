# Log Embedding Visualizer -- Backend Specification

## 1. Purpose

Process LLM agent run logs into an embedding visualization dataset for Embedding Atlas.

## 2. Architecture

The system has two distinct operations and three core components.

### Operations

**Load** -- pull new data from a source into the record store. Cheap,
incremental, can run frequently.

**Index** -- process accumulated records through the embedding and projection
pipeline, produce output. Expensive (requires a heavy model), runs as a
batch operation.

### Components

**DataSource** -- abstracts over where records come from. Handles discovery,
completeness checking, format parsing. The caller just asks for new records
and gets Records back. Implementations may read JSONL files, parquet files,
database tables, or any other backend.

**RecordStore** -- persists loaded Records between the load and index
operations. Accumulates records across multiple load runs. Tracks which
records have been indexed.

**Indexer** -- takes unindexed records from the store, generates embeddings,
projects to 2D, writes output. Operates in batch over all unindexed records.

### Triggering

Triggers decide *when* to invoke an operation. They are orthogonal to the
operations themselves -- neither the data source nor the indexer knows why
it was invoked.

Each operation has its own trigger. The natural trigger types differ:

**Load triggers** -- react to new data becoming available:

- Explicit signal (CLI command, API call)
- Filesystem watcher (new/changed files)
- Database notification (new rows)
- Polling (check at regular interval)

**Index triggers** -- decide when to run the expensive batch operation:

- Explicit signal (CLI command, API call)
- Threshold (N new unindexed records accumulated)
- Schedule (e.g. nightly reindex)

The first implementation uses explicit signals for both.

## 3. Loading

### Behavior

- When a load is triggered, the system asks the data source for new records.
- The data source determines which sources are new, which are ready, and
  reads them. All discovery, completeness, and format logic is internal to
  the data source.
- New records are persisted to the record store.
- When a source has already been loaded, the data source skips it.
- When the system restarts, it knows which sources were already loaded.

## 4. Indexing

### Embedding

- When indexing is triggered, the system takes all unindexed records from
  the record store.
- For each record, the system generates a vector embedding of the text field.
- When the embedding service is unavailable, the system retries with backoff.
- When a record fails to embed after retries, the system logs the error and
  skips that record.

### Projection

- When embeddings are generated for the first batch, the system fits a
  dimensionality reduction model and projects all vectors to 2D.
- When new embeddings arrive after the initial fit, the system projects
  them using the existing model.
- When a recompute is requested, the system refits the model on all stored
  embeddings and updates all projections.

### Output

- When indexing completes, the system atomically updates the output files
  so readers always see consistent data.
- The output contains all metadata, text, and 2D projections needed for
  Atlas visualization.

## 5. API

- `GET /health` -- return status and whether indexing is in progress.
- `POST /load` -- trigger a load operation.
- `POST /index` -- trigger an indexing operation.

## 6. Data Model

### 6.1 Record

| Field              | Type       | Description                       |
|--------------------|------------|-----------------------------------|
| id                 | string     | Deterministic, content-derived    |
| timestamp          | datetime   | When the log entry occurred       |
| filename           | string     | Source identifier                 |
| text               | string     | Content to embed                  |
| iteration          | int        | Iteration number in the agent run |
| idx_in_iteration   | int        | Index within the iteration        |
| type               | string     | Record classification             |

### 6.2 Logs Output (Atlas input)

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

### 6.3 Embeddings Output

| Column   | Type              |
|----------|-------------------|
| id       | string            |
| vector   | list<float32>     |

### 6.4 State

The system persists:

- Which sources have been loaded (to avoid reloading on restart).
- Which records have been indexed (to support incremental indexing).
- Projection fit state (to decide fit vs transform).

## 7. System Overview

    [Load Trigger] ----> Load:   [DataSource] --> [RecordStore]
    [Index Trigger] ---> Index:  [RecordStore] --> [Embedder] --> [Projector] --> Output

    Triggers are orthogonal to operations.
    API server exposes load, index, and health endpoints.
