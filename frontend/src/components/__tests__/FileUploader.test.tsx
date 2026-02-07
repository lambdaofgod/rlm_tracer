import { describe, test, expect, mock, afterEach } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import { FileUploader } from "../FileUploader";

afterEach(cleanup);

describe("FileUploader", () => {
  test("renders the Choose File button", () => {
    const onFileLoaded = mock(() => {});
    render(<FileUploader onFileLoaded={onFileLoaded} />);
    expect(screen.getByText("Choose File")).toBeDefined();
  });

  test("renders the drop zone text", () => {
    const onFileLoaded = mock(() => {});
    render(<FileUploader onFileLoaded={onFileLoaded} />);
    expect(
      screen.getByText("Drag & drop .jsonl file here"),
    ).toBeDefined();
  });
});
