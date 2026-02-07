"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Repeat, Code, GitBranch, Clock } from "lucide-react";
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

  const currentIteration = logFile.iterations[selectedIteration];

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
      {logFile.metadata.finalAnswer && (
        <div className="px-3 pb-2 text-sm">
          <span className="text-muted-foreground">A: </span>
          {formatAnswer(logFile.metadata.finalAnswer)}
        </div>
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
      <div className="min-h-0 flex-1">
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={50} minSize={20}>
            <TrajectoryPanel
              iterations={logFile.iterations}
              selectedIteration={selectedIteration}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50} minSize={20}>
            {currentIteration ? (
              <ExecutionPanel iteration={currentIteration} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No iteration selected
              </div>
            )}
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
