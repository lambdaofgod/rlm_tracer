# model_serving

Runs a local llama.cpp inference server for a HuggingFace-hosted GGUF model.
Exposes an OpenAI-compatible API (`/v1/chat/completions`, `/v1/completions`, `/v1/embeddings`).

## Usage

```
uv run python run_model.py
uv run python run_model.py --port 9090 --hf_model_name other/model:Q4_0
```

Run `uv run python run_model.py -- --help` to see all available flags.
