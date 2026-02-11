"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Code, GitBranch } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import type { RLMIteration, RLMChatCompletion } from "@/lib/types";

interface ExecutionPanelProps {
  iteration: RLMIteration;
}

export function ExecutionPanel({ iteration }: ExecutionPanelProps) {
  const allRlmCalls: RLMChatCompletion[] = iteration.code_blocks.flatMap(
    (cb) => cb.result.rlm_calls,
  );

  return (
    <Tabs defaultValue="code" className="flex h-full flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="code">
          Code Execution
          {iteration.code_blocks.length > 0 && (
            <Badge variant="outline" className="ml-1 text-[10px]">
              {iteration.code_blocks.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sublm">
          Sub-LM Calls
          {allRlmCalls.length > 0 && (
            <Badge variant="outline" className="ml-1 text-[10px]">
              {allRlmCalls.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="code" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-3">
            {iteration.code_blocks.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
                  <div className="mb-2 inline-block rounded-lg bg-muted/50 p-2">
                    <Code className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No code blocks in this iteration</p>
                </div>
              </div>
            ) : (
              iteration.code_blocks.map((block, i) => (
                <CodeBlock key={i} block={block} index={i} />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="sublm" className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-3">
            {allRlmCalls.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="rounded-lg border-2 border-dashed border-border/50 p-8 text-center">
                  <div className="mb-2 inline-block rounded-lg bg-muted/50 p-2">
                    <GitBranch className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No sub-LM calls in this iteration</p>
                </div>
              </div>
            ) : (
              allRlmCalls.map((call, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-fuchsia-500/20 bg-fuchsia-500/5 p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{call.model}</Badge>
                    <Badge variant="outline">depth {call.depth}</Badge>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {call.execution_time.toFixed(2)}s
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium">Prompt:</span>{" "}
                    {call.prompt.slice(0, 200)}
                    {call.prompt.length > 200 && "..."}
                  </div>
                  <div className="mt-1 text-xs">
                    <span className="font-medium">Response:</span>{" "}
                    {call.response.slice(0, 200)}
                    {call.response.length > 200 && "..."}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
