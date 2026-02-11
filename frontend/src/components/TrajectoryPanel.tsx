"use client";

import { useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Monitor, User, Bot } from "lucide-react";
import { SyntaxHighlight } from "./SyntaxHighlight";
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

const ROLE_ICON_STYLES: Record<string, string> = {
  system: "bg-gradient-to-br from-violet-500 to-violet-600",
  user: "bg-gradient-to-br from-emerald-500 to-emerald-600",
  assistant: "bg-gradient-to-br from-sky-500 to-sky-600",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  system: Monitor,
  user: User,
  assistant: Bot,
};

const ROLE_LABELS: Record<string, string> = {
  system: "System",
  user: "User",
  assistant: "Assistant",
};

type Segment =
  | { type: "text"; content: string }
  | { type: "code"; language: string; content: string };

const FENCE_RE = /```(\w*)\n([\s\S]*?)```/g;

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(FENCE_RE)) {
    const before = text.slice(lastIndex, match.index);
    if (before) segments.push({ type: "text", content: before });
    segments.push({
      type: "code",
      language: match[1] || "python",
      content: match[2],
    });
    lastIndex = match.index! + match[0].length;
  }

  const after = text.slice(lastIndex);
  if (after) segments.push({ type: "text", content: after });
  return segments;
}

function FormattedResponse({ text }: { text: string }) {
  const segments = useMemo(() => parseSegments(text), [text]);

  if (segments.length === 1 && segments[0].type === "text") {
    return (
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-background/60 p-2 font-mono text-xs">
        {text}
      </pre>
    );
  }

  return (
    <div className="max-h-96 space-y-2 overflow-auto rounded-lg bg-background/60 p-2">
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <pre key={i} className="whitespace-pre-wrap font-mono text-xs">
            {seg.content}
          </pre>
        ) : (
          <div key={i} className="overflow-x-auto rounded-md bg-muted/50 p-2">
            <SyntaxHighlight code={seg.content} language={seg.language} />
          </div>
        ),
      )}
    </div>
  );
}

function MessageCard({ message }: { message: PromptMessage }) {
  const Icon = ROLE_ICONS[message.role];
  return (
    <div
      className={cn(
        "rounded-xl border p-3",
        ROLE_STYLES[message.role] ?? "border-border",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            ROLE_ICON_STYLES[message.role] ?? "bg-muted",
          )}
        >
          {Icon && <Icon className="h-4 w-4 text-white" />}
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {ROLE_LABELS[message.role] ?? message.role}
        </span>
      </div>
      <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-background/60 p-2 font-mono text-xs">
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
      <div className="flex h-full items-center justify-center">
        <div className="rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
          <div className="mb-2 inline-block rounded-lg bg-muted/50 p-2">
            <Bot className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">No iterations to display</p>
        </div>
      </div>
    );
  }

  const prompt = iterations[0].prompt;

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
                  ? "border-2 border-primary bg-gradient-to-br from-sky-500/10 to-indigo-500/10 shadow-md"
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
              <FormattedResponse text={iter.response} />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
