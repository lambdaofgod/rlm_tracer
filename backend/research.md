# RESEARCH - Python Tools for Log Embedding Visualizer Backend

## Summary of spec.md

The system processes LLM agent run logs into embedding visualizations with:
- **Two operations**: Load (cheap, incremental) and Index (expensive, batch)
- **Three components**: DataSource, RecordStore, Indexer
- **Triggers**: Explicit signals initially, with potential for watchers/polling/schedules
- **REST API**: /health, /load, /index endpoints

---

## Proposed Approaches

### Approach 1: FastAPI + APScheduler + Huey (Minimal Stack)

**Tools**: FastAPI, APScheduler v4, Huey (lightweight Redis/SQLite queue)

**Why it fits**:
- Direct mapping from spec to code - no orchestration overhead
- Huey provides simple persistent task queue with SQLite backend
- APScheduler v4 (2024 rewrite) handles all trigger types cleanly
- Fast to build, minimal dependencies

**Trade-offs**:
- ✅ Fastest to MVP, easy to understand
- ✅ No external infrastructure required (SQLite mode)
- ❌ Must implement retry/backoff manually
- ❌ Single instance only, no horizontal scaling

---

### Approach 2: Prefect 2.x (or Burr)

**Tools**: Prefect 2.x for orchestration, FastAPI thin wrapper for custom endpoints

**Why it fits**:
- Built-in retry with exponential backoff (spec explicitly needs this for embedding failures)
- State tracking and observability out of the box
- Flows triggered via API or Prefect's native triggers
- Burr (2024, same team as Hamilton) is a lighter alternative designed for stateful AI pipelines

**Trade-offs**:
- ✅ Robust retry, logging, state management built-in
- ✅ Nice monitoring UI for debugging
- ❌ Adds infrastructure (Prefect server or cloud)
- ❌ May feel like overkill for two operations

---

### Approach 3: txtai Workflows (Domain-Specific)

**Tools**: txtai (embedding pipeline framework), FastAPI

**Why it fits**:
- txtai is specifically designed for embedding pipelines
- Has built-in workflows, indexing, and even its own API server
- Handles the embedding + projection logic natively
- Less "orchestration framework", more "embedding toolkit"

**Trade-offs**:
- ✅ Domain-specific - embeddings are first-class
- ✅ Includes vector storage, similarity search
- ❌ Less flexibility for custom trigger logic
- ❌ Smaller community than Prefect/Celery

---

## Alternative/Similar Projects Discovered

| Project | Description |
|---------|-------------|
| **Nomic Atlas** | Commercial service doing exactly this - text → embeddings → interactive viz |
| **Lilac** | Dataset exploration with auto-embedding + UMAP (Google AI team) |
| **Renumics Spotlight** | Interactive embedding visualization for dataframes |
| **Hamilton** | Lightweight DAG framework where functions ARE the pipeline |
| **Burr** | State machine for AI apps with persistence (2024) |
| **Hatchet** | Durable execution engine, simpler Temporal alternative (2024) |
| **Dramatiq** | Cleaner Celery alternative, same broker model |

---

## Recommendation

**Start with Approach 1** - the spec says "first implementation uses explicit signals for both", so you don't need scheduling infrastructure on day one. FastAPI + Huey gives you the load/index operations with persistent state tracking.

**Graduate to Approach 2 (Prefect)** when you need robust retry handling for embedding service failures or better observability.

**Consider Approach 3 (txtai)** if the embedding logic becomes complex and you want domain-specific tooling rather than general orchestration.

