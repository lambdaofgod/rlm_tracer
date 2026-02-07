import type { RLMLogFile, RLMIteration } from "@/lib/types";

export function createMockIteration(
  overrides?: Partial<RLMIteration>,
): RLMIteration {
  return {
    iteration: 1,
    timestamp: "2025-01-01T00:00:00Z",
    prompt: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "Test question?" },
    ],
    response: "I will write code to solve this.",
    code_blocks: [
      {
        code: "print('hello')",
        result: {
          stdout: "hello\n",
          stderr: "",
          locals: {},
          execution_time: 0.5,
          rlm_calls: [],
        },
      },
    ],
    final_answer: null,
    iteration_time: 0.5,
    ...overrides,
  };
}

export function createMockLogFile(
  overrides?: Partial<RLMLogFile>,
): RLMLogFile {
  return {
    fileName: "test.jsonl",
    filePath: "test.jsonl",
    iterations: [
      createMockIteration(),
      createMockIteration({
        iteration: 2,
        response: "The answer is 42.",
        code_blocks: [],
        final_answer: "42",
        iteration_time: 0,
      }),
    ],
    metadata: {
      totalIterations: 2,
      totalCodeBlocks: 1,
      totalSubLMCalls: 0,
      totalExecutionTime: 0.5,
      contextQuestion: "Test question?",
      finalAnswer: "42",
    },
    config: {
      root_model: "gpt-4o",
      max_depth: 2,
      backend: "openai",
    },
    ...overrides,
  };
}
