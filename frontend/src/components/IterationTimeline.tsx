"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RLMIteration } from "@/lib/types";

interface IterationTimelineProps {
  iterations: RLMIteration[];
  selectedIteration: number;
  onSelect: (index: number) => void;
}

export function IterationTimeline({
  iterations,
  selectedIteration,
  onSelect,
}: IterationTimelineProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 p-2">
        {iterations.map((iter, i) => {
          const isSelected = i === selectedIteration;
          const isFinal = iter.final_answer !== null;

          return (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={cn(
                "w-48 shrink-0 rounded-lg border p-3 text-left transition-all hover:border-primary/40",
                isSelected
                  ? "border-primary shadow-sm"
                  : "border-border",
              )}
            >
              <div className="mb-1 flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isFinal
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {iter.iteration}
                </div>
                <div className="flex gap-1">
                  {iter.code_blocks.length > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {iter.code_blocks.length} code
                    </Badge>
                  )}
                  {isFinal && (
                    <Badge variant="outline" className="text-[10px] text-emerald-600">
                      Final
                    </Badge>
                  )}
                </div>
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {iter.response.slice(0, 80)}
                {iter.response.length > 80 && "..."}
              </p>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
