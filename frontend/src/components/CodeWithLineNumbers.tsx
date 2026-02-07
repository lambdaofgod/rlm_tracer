"use client";

import { SyntaxHighlight } from "./SyntaxHighlight";

interface CodeWithLineNumbersProps {
  code: string;
  language: string;
  startLine?: number;
}

export function CodeWithLineNumbers({
  code,
  language,
  startLine = 1,
}: CodeWithLineNumbersProps) {
  const lines = code.split("\n");
  const digits = String(startLine + lines.length - 1).length;

  return (
    <div className="flex overflow-hidden rounded-lg bg-muted/30 p-3">
      <pre className="select-none pr-4 text-right font-mono text-[13px] leading-[1.6] text-muted-foreground">
        {lines.map((_, i) => (
          <div key={i} style={{ minWidth: `${digits}ch` }}>
            {startLine + i}
          </div>
        ))}
      </pre>
      <pre className="flex-1 overflow-x-auto font-mono text-[13px] leading-[1.6] [tab-size:2]">
        {lines.map((line, i) => (
          <div key={i}>
            <SyntaxHighlight code={line} language={language} />
          </div>
        ))}
      </pre>
    </div>
  );
}
