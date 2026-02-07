// ---------------------------------------------------------------------------
// Raw JSONL entry types (used internally by the parser)
// ---------------------------------------------------------------------------

export interface RLMMetadataEntry {
  type: "metadata";
  config: RLMConfigMetadata;
  timestamp?: string;
}

export interface RLMInitialPromptEntry {
  type: "initial_prompt";
  prompt: PromptMessage[];
  timestamp?: string;
}

export interface RLMIterationEntry {
  type: "iteration";
  iteration: number;
  response: string;
  code_blocks: RawCodeBlock[];
  final_answer: string | [string, string] | null;
  timestamp?: string;
}

export type RLMEntry = RLMMetadataEntry | RLMInitialPromptEntry | RLMIterationEntry;

export interface RawCodeBlock {
  code: string;
  result: RawREPLResult;
}

export interface RawREPLResult {
  stdout: string;
  stderr: string;
  locals: Record<string, unknown>;
  execution_time: number;
  rlm_calls?: RLMChatCompletion[];
}

// ---------------------------------------------------------------------------
// Domain types (used by UI components)
// ---------------------------------------------------------------------------

export interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RLMChatCompletion {
  model: string;
  prompt: string;
  response: string;
  depth: number;
  execution_time: number;
}

export interface REPLResult {
  stdout: string;
  stderr: string;
  locals: Record<string, unknown>;
  execution_time: number;
  rlm_calls: RLMChatCompletion[];
}

export interface CodeBlock {
  code: string;
  result: REPLResult;
}

export interface RLMIteration {
  iteration: number;
  timestamp: string;
  prompt: PromptMessage[];
  response: string;
  code_blocks: CodeBlock[];
  final_answer: string | [string, string] | null;
  iteration_time: number;
}

export interface RLMConfigMetadata {
  root_model: string;
  max_depth: number;
  backend: string;
  [key: string]: unknown;
}

export interface RLMLogMetadata {
  totalIterations: number;
  totalCodeBlocks: number;
  totalSubLMCalls: number;
  totalExecutionTime: number;
  contextQuestion: string;
  finalAnswer: string | [string, string] | null;
}

export interface RLMLogFile {
  fileName: string;
  filePath: string;
  iterations: RLMIteration[];
  metadata: RLMLogMetadata;
  config: RLMConfigMetadata;
}
