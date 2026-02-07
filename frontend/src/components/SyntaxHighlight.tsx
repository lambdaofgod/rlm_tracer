"use client";

import { useMemo } from "react";

interface Token {
  type: string;
  text: string;
}

const PYTHON_PATTERNS: [string, RegExp][] = [
  ["comment", /^#[^\n]*/],
  ["string", /^"""[\s\S]*?"""|^'''[\s\S]*?'''|^"(?:\\.|[^"\\])*"|^'(?:\\.|[^'\\])*'/],
  ["keyword", /^(?:def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|yield|lambda|pass|break|continue|and|or|not|in|is|True|False|None|async|await)\b/],
  ["builtin", /^(?:print|len|range|int|str|float|list|dict|set|tuple|type|isinstance|enumerate|zip|map|filter|sorted|sum|min|max|abs|open|input|super|property|staticmethod|classmethod)\b/],
  ["function", /^[a-zA-Z_]\w*(?=\s*\()/],
  ["number", /^\d+(?:\.\d+)?/],
  ["operator", /^[+\-*/%=<>!&|^~:]+|^\./],
  ["whitespace", /^\s+/],
];

const COLOR_MAP: Record<string, string> = {
  keyword: "oklch(0.7 0.2 320)",
  builtin: "oklch(0.8 0.15 195)",
  string: "oklch(0.75 0.15 145)",
  number: "oklch(0.85 0.15 45)",
  comment: "oklch(0.55 0.05 260)",
  operator: "oklch(0.7 0.1 260)",
  function: "oklch(0.85 0.12 220)",
};

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;

  while (pos < code.length) {
    let matched = false;

    for (const [type, pattern] of PYTHON_PATTERNS) {
      const match = code.slice(pos).match(pattern);
      if (match) {
        tokens.push({ type, text: match[0] });
        pos += match[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      tokens.push({ type: "plain", text: code[pos] });
      pos += 1;
    }
  }

  return tokens;
}

interface SyntaxHighlightProps {
  code: string;
  language: string;
}

export function SyntaxHighlight({ code, language }: SyntaxHighlightProps) {
  const tokens = useMemo(
    () => (language === "python" ? tokenize(code) : [{ type: "plain", text: code }]),
    [code, language],
  );

  return (
    <code className="font-mono text-[13px] leading-[1.6] [tab-size:2]">
      {tokens.map((token, i) => {
        const color = COLOR_MAP[token.type];
        return color ? (
          <span key={i} style={{ color }}>
            {token.text}
          </span>
        ) : (
          <span key={i}>{token.text}</span>
        );
      })}
    </code>
  );
}
