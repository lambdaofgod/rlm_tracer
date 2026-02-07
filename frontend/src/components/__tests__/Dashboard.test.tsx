import { describe, test, expect, afterEach } from "bun:test";
import { render, screen, cleanup } from "@testing-library/react";
import { Dashboard } from "../Dashboard";

afterEach(cleanup);

describe("Dashboard", () => {
  test("renders the heading", () => {
    render(<Dashboard />);
    expect(screen.getByText("RLM Visualizer")).toBeDefined();
  });

  test("renders the file uploader", () => {
    render(<Dashboard />);
    expect(screen.getByText("Choose File")).toBeDefined();
  });

  test("renders the upload section label", () => {
    render(<Dashboard />);
    expect(screen.getByText("Upload Log File")).toBeDefined();
  });
});
