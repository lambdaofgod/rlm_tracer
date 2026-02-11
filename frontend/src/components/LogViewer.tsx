"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Repeat, Code, GitBranch, Clock, FileText, Check, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { IterationTimeline } from "./IterationTimeline";
import { TrajectoryPanel } from "./TrajectoryPanel";
import { ExecutionPanel } from "./ExecutionPanel";
import { StatsCard } from "./StatsCard";
import { ThemeToggle } from "./ThemeToggle";
import type { RLMLogFile } from "@/lib/types";

interface LogViewerProps {
  logFile: RLMLogFile;
  onBack: () => void;
}

function formatAnswer(answer: string | [string, string] | null): string {
  if (answer === null) return "";
  if (Array.isArray(answer)) return answer.join(" | ");
  return answer;
}

export function LogViewer({ logFile, onBack }: LogViewerProps) {
  const [selectedIteration, setSelectedIteration] = useState(0);
  const [answerOpen, setAnswerOpen] = useState(true);

  const currentIteration = logFile.iterations[selectedIteration];
  const lastIter = logFile.iterations[logFile.iterations.length - 1];
  const finalAnswer = lastIter?.final_answer ?? null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "k") {
        setSelectedIteration((prev) =>
          Math.min(prev + 1, logFile.iterations.length - 1),
        );
      } else if (e.key === "ArrowLeft" || e.key === "j") {
        setSelectedIteration((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        onBack();
      }
    },
    [logFile.iterations.length, onBack],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b p-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <span className="font-mono text-sm font-medium">
          {logFile.fileName}
        </span>
        <span className="text-xs text-muted-foreground">
          {logFile.config.root_model} / {logFile.config.backend}
        </span>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-2 overflow-x-auto p-2">
        <StatsCard
          label="Iterations"
          value={logFile.metadata.totalIterations}
          icon={Repeat}
          variant="cyan"
        />
        <StatsCard
          label="Code Blocks"
          value={logFile.metadata.totalCodeBlocks}
          icon={Code}
          variant="green"
        />
        <StatsCard
          label="Sub-LM Calls"
          value={logFile.metadata.totalSubLMCalls}
          icon={GitBranch}
          variant="magenta"
        />
        <StatsCard
          label="Exec Time"
          value={`${logFile.metadata.totalExecutionTime.toFixed(2)}s`}
          icon={Clock}
          variant="yellow"
        />
      </div>

      {/* Context / Final answer summary */}
      {logFile.metadata.contextQuestion && (
        <div className="px-3 pb-1 text-sm">
          <span className="text-muted-foreground">Q: </span>
          {logFile.metadata.contextQuestion.slice(0, 120)}
          {logFile.metadata.contextQuestion.length > 120 && "..."}
        </div>
      )}

      {/* Final answer strip */}
      {finalAnswer && (
        <Collapsible open={answerOpen} onOpenChange={setAnswerOpen}>
          <CollapsibleTrigger className="flex w-full items-center gap-2 border-y border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-left text-sm hover:bg-emerald-500/10">
            <ChevronRight
              className={cn(
                "h-4 w-4 text-emerald-600 transition-transform dark:text-emerald-400",
                answerOpen && "rotate-90",
              )}
            />
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Check className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Final Answer
            </span>
            <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
              {formatAnswer(finalAnswer).slice(0, 80)}
              {formatAnswer(finalAnswer).length > 80 && "..."}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="max-h-[75vh] overflow-auto border-b border-emerald-500/30 bg-emerald-500/5 px-3 py-2 font-mono text-xs whitespace-pre-wrap">
              {formatAnswer(finalAnswer)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Timeline */}
      <div className="border-y">
        <IterationTimeline
          iterations={logFile.iterations}
          selectedIteration={selectedIteration}
          onSelect={setSelectedIteration}
        />
      </div>

      {/* Main content: resizable split */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full overflow-hidden">
              <TrajectoryPanel
                iterations={logFile.iterations}
                selectedIteration={selectedIteration}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            <div className="h-full overflow-hidden">
              {currentIteration ? (
                <ExecutionPanel iteration={currentIteration} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
                    <div className="mb-2 inline-block rounded-lg bg-muted/50 p-2">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">No iteration selected</p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Footer: keyboard hints */}
      <div className="flex items-center gap-4 border-t p-2 text-xs text-muted-foreground">
        <span>
          <kbd className="rounded border px-1 font-mono">Left/j</kbd> Prev
        </span>
        <span>
          <kbd className="rounded border px-1 font-mono">Right/k</kbd> Next
        </span>
        <span>
          <kbd className="rounded border px-1 font-mono">Esc</kbd> Back
        </span>
      </div>
    </div>
  );
}
