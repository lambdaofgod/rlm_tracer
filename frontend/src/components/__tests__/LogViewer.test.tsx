import { describe, test, expect, mock, afterEach } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import { LogViewer } from "../LogViewer";
import { createMockLogFile } from "./fixtures";

afterEach(cleanup);

describe("LogViewer", () => {
  const mockBack = mock(() => {});
  const logFile = createMockLogFile();

  test("renders the filename in the header", () => {
    render(<LogViewer logFile={logFile} onBack={mockBack} />);
    expect(screen.getByText("test.jsonl")).toBeDefined();
  });

  test("renders stats cards", () => {
    render(<LogViewer logFile={logFile} onBack={mockBack} />);
    expect(screen.getByText("Iterations")).toBeDefined();
    expect(screen.getByText("Code Blocks")).toBeDefined();
  });

  test("renders the context question", () => {
    render(<LogViewer logFile={logFile} onBack={mockBack} />);
    expect(screen.getAllByText(/Test question/).length).toBeGreaterThan(0);
  });
});
