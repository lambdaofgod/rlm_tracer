import { describe, test, expect, beforeAll } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import { parseLogFile } from "../parse-logs";
import type { RLMLogFile } from "../types";

// ---------------------------------------------------------------------------
// Fixture parsing
// ---------------------------------------------------------------------------

describe("parseLogFile", () => {
  let result: RLMLogFile;

  beforeAll(() => {
    const text = readFileSync(join(__dirname, "fixture.jsonl"), "utf-8");
    result = parseLogFile(text, "fixture.jsonl");
  });

  describe("fixture parsing", () => {
    test("parses without errors and returns correct shape", () => {
      expect(result).toBeDefined();
      expect(result.fileName).toBe("fixture.jsonl");
      expect(result.filePath).toBe("fixture.jsonl");
      expect(Array.isArray(result.iterations)).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.config).toBeDefined();
    });

    test("extracts correct iteration count", () => {
      expect(result.iterations.length).toBe(2);
      expect(result.metadata.totalIterations).toBe(2);
    });

    test("extracts config from metadata entry", () => {
      expect(result.config.root_model).toBe("gpt-4o");
      expect(result.config.max_depth).toBe(3);
      expect(result.config.backend).toBe("openai");
    });

    test("computes metadata correctly", () => {
      expect(result.metadata.totalCodeBlocks).toBe(1);
      expect(result.metadata.totalSubLMCalls).toBe(1);
      expect(result.metadata.contextQuestion).toBe(
        "What is the sum of the first 10 prime numbers?",
      );
      expect(result.metadata.finalAnswer).toBe("129");
    });

    test("copies initial prompt into iterations", () => {
      expect(result.iterations[0].prompt.length).toBe(2);
      expect(result.iterations[0].prompt[0].role).toBe("system");
      expect(result.iterations[0].prompt[1].role).toBe("user");
      expect(result.iterations[1].prompt.length).toBe(2);
    });

    test("parses iteration 1 code blocks", () => {
      const cb = result.iterations[0].code_blocks;
      expect(cb.length).toBe(1);
      expect(cb[0].code).toContain("is_prime");
      expect(cb[0].result.stdout).toContain("Sum: 129");
      expect(cb[0].result.stderr).toBe("");
      expect(cb[0].result.execution_time).toBe(0.45);
    });

    test("parses sub-LM calls", () => {
      const calls = result.iterations[0].code_blocks[0].result.rlm_calls;
      expect(calls.length).toBe(1);
      expect(calls[0].model).toBe("gpt-4o-mini");
      expect(calls[0].depth).toBe(1);
    });

    test("parses final answer on last iteration", () => {
      expect(result.iterations[0].final_answer).toBeNull();
      expect(result.iterations[1].final_answer).toBe("129");
    });

    test("computes iteration_time from code block execution times", () => {
      expect(result.iterations[0].iteration_time).toBe(0.45);
      expect(result.iterations[1].iteration_time).toBe(0);
    });

    test("computes totalExecutionTime", () => {
      expect(result.metadata.totalExecutionTime).toBe(0.45);
    });
  });

  // ---------------------------------------------------------------------------
  // Malformed input handling
  // ---------------------------------------------------------------------------

  describe("malformed input handling", () => {
    test("returns empty log for empty string", () => {
      const empty = parseLogFile("", "empty.jsonl");
      expect(empty.iterations.length).toBe(0);
      expect(empty.metadata.totalIterations).toBe(0);
      expect(empty.config.root_model).toBe("unknown");
      expect(empty.config.max_depth).toBe(0);
      expect(empty.config.backend).toBe("unknown");
    });

    test("skips invalid JSON lines and parses rest", () => {
      const text = [
        "not valid json",
        '{"type":"iteration","iteration":1,"response":"hello","code_blocks":[],"final_answer":"done"}',
      ].join("\n");
      const parsed = parseLogFile(text, "bad.jsonl");
      expect(parsed.iterations.length).toBe(1);
      expect(parsed.iterations[0].response).toBe("hello");
    });

    test("skips lines without type field", () => {
      const text = [
        '{"foo":"bar"}',
        '{"type":"iteration","iteration":1,"response":"ok","code_blocks":[],"final_answer":null}',
      ].join("\n");
      const parsed = parseLogFile(text, "notype.jsonl");
      expect(parsed.iterations.length).toBe(1);
    });

    test("handles missing rlm_calls gracefully", () => {
      const text =
        '{"type":"iteration","iteration":1,"response":"x","code_blocks":[{"code":"1+1","result":{"stdout":"2","stderr":"","locals":{},"execution_time":0.1}}],"final_answer":null}';
      const parsed = parseLogFile(text, "no-rlm.jsonl");
      expect(parsed.iterations[0].code_blocks[0].result.rlm_calls).toEqual([]);
    });

    test("uses fallback config when no metadata entry", () => {
      const text =
        '{"type":"iteration","iteration":1,"response":"x","code_blocks":[],"final_answer":"y"}';
      const parsed = parseLogFile(text, "noconfig.jsonl");
      expect(parsed.config.root_model).toBe("unknown");
      expect(parsed.config.max_depth).toBe(0);
      expect(parsed.config.backend).toBe("unknown");
    });

    test("handles iteration with empty code_blocks", () => {
      const text =
        '{"type":"iteration","iteration":1,"response":"x","code_blocks":[],"final_answer":null}';
      const parsed = parseLogFile(text, "empty-cb.jsonl");
      expect(parsed.iterations[0].code_blocks.length).toBe(0);
      expect(parsed.iterations[0].iteration_time).toBe(0);
    });
  });
});
