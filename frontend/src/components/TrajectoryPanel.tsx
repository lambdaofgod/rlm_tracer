"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RLMIteration, PromptMessage } from "@/lib/types";

interface TrajectoryPanelProps {
  iterations: RLMIteration[];
  selectedIteration: number;
}

const ROLE_STYLES: Record<string, string> = {
  system: "border-violet-500/20 bg-violet-500/5",
  user: "border-emerald-500/20 bg-emerald-500/5",
  assistant: "border-sky-500/20 bg-sky-500/5",
};

const ROLE_LABELS: Record<string, string> = {
  system: "System",
  user: "User",
  assistant: "Assistant",
};

function MessageCard({ message }: { message: PromptMessage }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        ROLE_STYLES[message.role] ?? "border-border",
      )}
    >
      <div className="mb-1 text-xs font-medium text-muted-foreground">
        {ROLE_LABELS[message.role] ?? message.role}
      </div>
      <pre className="whitespace-pre-wrap rounded-lg bg-background/60 p-2 font-mono text-xs">
        {message.content}
      </pre>
    </div>
  );
}

export function TrajectoryPanel({
  iterations,
  selectedIteration,
}: TrajectoryPanelProps) {
  if (iterations.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No iterations
      </div>
    );
  }

  const prompt = iterations[0].prompt;
  const lastIdx = iterations.length - 1;
  const finalAnswer =
    selectedIteration === lastIdx
      ? iterations[lastIdx].final_answer
      : null;

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-3">
        {/* Prompt messages */}
        {prompt.map((msg, i) => (
          <MessageCard key={`prompt-${i}`} message={msg} />
        ))}

        {/* Iteration responses up to selected */}
        {iterations.slice(0, selectedIteration + 1).map((iter, i) => (
          <div key={`iter-${i}`}>
            {i > 0 && (
              <div className="my-2 text-center text-[10px] text-muted-foreground">
                ---- iter {iter.iteration} ----
              </div>
            )}
            <div
              className={cn(
                "rounded-xl border p-3",
                i === selectedIteration
                  ? "border-2 border-primary shadow-sm"
                  : "border-sky-500/20 bg-sky-500/5",
              )}
            >
              <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>LM Response</span>
                {iter.final_answer && (
                  <Badge variant="outline" className="text-[10px] text-emerald-600">
                    Final
                  </Badge>
                )}
              </div>
              <pre className="whitespace-pre-wrap rounded-lg bg-background/60 p-2 font-mono text-xs">
                {iter.response}
              </pre>
            </div>
          </div>
        ))}

        {/* Final answer card */}
        {finalAnswer && (
          <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-500/5 p-4 shadow-sm">
            <div className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Final Answer
            </div>
            <div className="font-mono text-[15px]">
              {Array.isArray(finalAnswer) ? finalAnswer.join(" | ") : finalAnswer}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
