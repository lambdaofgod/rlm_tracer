import subprocess
import sys

import fire


def serve(
    hf_model_name: str = "cameronbergh/rlm-qwen3-8b-v0.1-gguf:Q8_0",
    port: int = 8080,
    host: str = "127.0.0.1",
    ctx_size: int = 0,
    n_predict: int = -1,
):
    cmd = [
        "llama-server",
        "-hf", hf_model_name,
        "--port", str(port),
        "--host", host,
        "--ctx-size", str(ctx_size),
        "--n-predict", str(n_predict),
    ]
    sys.exit(subprocess.call(cmd))


if __name__ == "__main__":
    fire.Fire(serve)
