import type {
  CodeBlock,
  PromptMessage,
  RLMConfigMetadata,
  RLMEntry,
  RLMIteration,
  RLMLogFile,
  RawCodeBlock,
} from "./types";

const FALLBACK_CONFIG: RLMConfigMetadata = {
  root_model: "unknown",
  max_depth: 0,
  backend: "unknown",
};

function normalizeCodeBlock(raw: RawCodeBlock): CodeBlock {
  return {
    code: raw.code,
    result: {
      stdout: raw.result.stdout ?? "",
      stderr: raw.result.stderr ?? "",
      locals: raw.result.locals ?? {},
      execution_time: raw.result.execution_time ?? 0,
      rlm_calls: raw.result.rlm_calls ?? [],
    },
  };
}

export function parseLogFile(text: string, fileName: string): RLMLogFile {
  let config: RLMConfigMetadata | null = null;
  let initialPrompt: PromptMessage[] = [];
  const iterations: RLMIteration[] = [];

  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;

    let entry: RLMEntry;
    try {
      entry = JSON.parse(line);
    } catch {
      console.warn(`Line ${i + 1}: invalid JSON, skipping`);
      continue;
    }

    if (!entry || typeof entry !== "object" || !("type" in entry)) {
      console.warn(`Line ${i + 1}: missing "type" field, skipping`);
      continue;
    }

    switch (entry.type) {
      case "metadata":
        config = entry.config;
        break;

      case "initial_prompt":
        initialPrompt = entry.prompt ?? [];
        break;

      case "iteration": {
        const codeBlocks = (entry.code_blocks ?? []).map(normalizeCodeBlock);
        const iterationTime = codeBlocks.reduce(
          (sum, cb) => sum + cb.result.execution_time,
          0,
        );

        iterations.push({
          iteration: entry.iteration,
          timestamp: entry.timestamp ?? "",
          prompt: initialPrompt,
          response: entry.response ?? "",
          code_blocks: codeBlocks,
          final_answer: entry.final_answer ?? null,
          iteration_time: iterationTime,
        });
        break;
      }

      default:
        console.warn(
          `Line ${i + 1}: unknown entry type "${(entry as { type: string }).type}", skipping`,
        );
    }
  }

  const totalCodeBlocks = iterations.reduce(
    (sum, it) => sum + it.code_blocks.length,
    0,
  );
  const totalSubLMCalls = iterations.reduce(
    (sum, it) =>
      sum +
      it.code_blocks.reduce((s, cb) => s + cb.result.rlm_calls.length, 0),
    0,
  );
  const totalExecutionTime = iterations.reduce(
    (sum, it) => sum + it.iteration_time,
    0,
  );
  const contextQuestion =
    initialPrompt.find((m) => m.role === "user")?.content ?? "";
  const finalAnswer =
    iterations.length > 0
      ? iterations[iterations.length - 1].final_answer
      : null;

  return {
    fileName,
    filePath: fileName,
    iterations,
    metadata: {
      totalIterations: iterations.length,
      totalCodeBlocks,
      totalSubLMCalls,
      totalExecutionTime,
      contextQuestion,
      finalAnswer,
    },
    config: config ?? FALLBACK_CONFIG,
  };
}
