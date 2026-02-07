"use client";

import { useState, useEffect } from "react";

const CURSOR = ["|", "/", "-", "\\"];

const DIAGRAM = `
  +--- Depth 0 ----------------+
  |                             |
  |   LM  <====>  REPL         |
  |   |            |            |
  |   v            v            |
  |  [sub-RLM]  [sub-RLM]      |
  |   |            |            |
  |   LM <-> REPL  LM <-> REPL |
  |                             |
  +--- Depth 1 ----------------+
`.trimStart();

export function AsciiRLM() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <pre className="font-mono text-xs text-muted-foreground">
      {DIAGRAM}
      <span className="text-primary">{CURSOR[frame % CURSOR.length]}</span>
    </pre>
  );
}
