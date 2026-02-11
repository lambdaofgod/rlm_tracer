"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { CodeWithLineNumbers } from "./CodeWithLineNumbers";
import { cn } from "@/lib/utils";
import type { CodeBlock as CodeBlockType } from "@/lib/types";

const COLLAPSE_THRESHOLD = 1024;

function formatPythonRepr(val: unknown): string {
  if (typeof val === "string") return val;
  if (val === null) return "None";
  if (val === undefined) return "None";
  if (typeof val === "boolean") return val ? "True" : "False";
  if (typeof val === "number") return String(val);
  return JSON.stringify(val, null, 2);
}

function VariableRow({ name, value }: { name: string; value: unknown }) {
  const formatted = formatPythonRepr(value);
  const isLong = formatted.length > COLLAPSE_THRESHOLD;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="font-mono text-xs">
      <div className="flex items-start gap-1">
        <span className="shrink-0 text-sky-600 dark:text-sky-400">{name}</span>
        <span className="shrink-0">=</span>
        {!isLong ? (
          <pre className="whitespace-pre-wrap text-amber-600 dark:text-amber-400">
            {formatted}
          </pre>
        ) : (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger className="flex items-center gap-1 text-left hover:opacity-80">
              <ChevronRight
                className={cn(
                  "h-3 w-3 shrink-0 transition-transform",
                  isExpanded && "rotate-90",
                )}
              />
              <span className="truncate text-amber-600 dark:text-amber-400">
                {formatted.slice(0, 80)}...
              </span>
              <Badge variant="outline" className="shrink-0 text-[9px]">
                {formatted.length} chars
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap rounded-md bg-background/60 p-2 text-amber-600 dark:text-amber-400">
                {formatted}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </div>
  );
}

interface CodeBlockProps {
  block: CodeBlockType;
  index: number;
}

export function CodeBlock({ block, index }: CodeBlockProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5">
        <CollapsibleTrigger className="flex w-full items-center gap-2 p-3 text-left text-sm hover:bg-muted/50">
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-90",
            )}
          />
          <span className="font-medium">Code Block #{index + 1}</span>
          <Badge variant="outline" className="ml-auto font-mono text-xs">
            {block.result.execution_time.toFixed(2)}s
          </Badge>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-0 border-t">
            {/* Code */}
            <div className="p-3">
              <CodeWithLineNumbers code={block.code} language="python" />
            </div>

            {/* Stdout */}
            {block.result.stdout && (
              <div className="border-t p-3">
                <div className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">
                  stdout
                </div>
                <pre className="whitespace-pre-wrap rounded-lg bg-emerald-500/5 p-2 font-mono text-xs">
                  {block.result.stdout}
                </pre>
              </div>
            )}

            {/* Stderr */}
            {block.result.stderr && (
              <div className="border-t p-3">
                <div className="mb-1 text-[10px] font-medium uppercase text-red-500">
                  stderr
                </div>
                <pre className="whitespace-pre-wrap rounded-lg bg-red-500/5 p-2 font-mono text-xs text-red-600 dark:text-red-400">
                  {block.result.stderr}
                </pre>
              </div>
            )}

            {/* Variables */}
            {Object.keys(block.result.locals).length > 0 && (
              <div className="border-t p-3">
                <div className="mb-1 text-[10px] font-medium uppercase text-muted-foreground">
                  variables
                </div>
                <div className="space-y-1">
                  {Object.entries(block.result.locals).map(([key, val]) => (
                    <VariableRow key={key} name={key} value={val} />
                  ))}
                </div>
              </div>
            )}

            {/* Sub-LM calls */}
            {block.result.rlm_calls.length > 0 && (
              <div className="border-t bg-fuchsia-500/5 p-3">
                <div className="mb-1 text-[10px] font-medium uppercase text-fuchsia-500">
                  sub-lm calls
                </div>
                <div className="space-y-2">
                  {block.result.rlm_calls.map((call, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-fuchsia-500/20 p-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {call.model}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          depth {call.depth}
                        </Badge>
                        <span className="ml-auto font-mono text-muted-foreground">
                          {call.execution_time.toFixed(2)}s
                        </span>
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        {call.prompt.slice(0, 200)}
                        {call.prompt.length > 200 && "..."}
                      </div>
                      <div className="mt-1">{call.response.slice(0, 200)}{call.response.length > 200 && "..."}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
