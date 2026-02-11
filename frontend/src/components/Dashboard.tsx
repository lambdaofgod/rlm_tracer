"use client";

import { useState, useEffect, useCallback } from "react";
import { parseLogFile } from "@/lib/parse-logs";
import { FileUploader } from "./FileUploader";
import { AsciiRLM } from "./AsciiGlobe";
import { LogViewer } from "./LogViewer";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";
import type { RLMLogFile } from "@/lib/types";

export function Dashboard() {
  const [logFiles, setLogFiles] = useState<RLMLogFile[]>([]);
  const [selectedLog, setSelectedLog] = useState<RLMLogFile | null>(null);
  const [demoLogs, setDemoLogs] = useState<RLMLogFile[]>([]);

  useEffect(() => {
    fetch("/api/logs")
      .then((r) => r.json())
      .then((files: string[]) =>
        Promise.all(
          files.map((f) =>
            fetch(`/logs/${f}`)
              .then((r) => r.text())
              .then((text) => parseLogFile(text, f)),
          ),
        ),
      )
      .then(setDemoLogs)
      .catch(() => {});
  }, []);

  const handleFileLoaded = useCallback(
    (text: string, fileName: string) => {
      const parsed = parseLogFile(text, fileName);
      setLogFiles((prev) => [...prev, parsed]);
      setSelectedLog(parsed);
    },
    [],
  );

  const handleBack = useCallback(() => setSelectedLog(null), []);

  if (selectedLog) {
    return <LogViewer logFile={selectedLog} onBack={handleBack} />;
  }

  return (
    <div className="dashboard-bg relative flex min-h-screen flex-col overflow-hidden">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center border-b bg-background/80 p-4 backdrop-blur-sm">
        <h1 className="text-xl font-bold">RLM Visualizer</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 flex-1 p-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left column */}
          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                Upload Log File
              </h2>
              <FileUploader onFileLoaded={handleFileLoaded} />
            </div>
            <div>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                RLM Architecture
              </h2>
              <div className="rounded-lg border p-4">
                <AsciiRLM />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Demo traces */}
            {demoLogs.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                  Demo Traces
                </h2>
                <div className="space-y-2">
                  {demoLogs.map((log) => (
                    <button
                      key={log.fileName}
                      onClick={() => setSelectedLog(log)}
                      className="flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm hover:bg-muted/50"
                    >
                      <span className="font-mono">{log.fileName}</span>
                      <Badge variant="outline" className="ml-auto">
                        {log.metadata.totalIterations} iter
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loaded files */}
            {logFiles.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                  Loaded Files
                </h2>
                <div className="space-y-2">
                  {logFiles.map((log) => (
                    <button
                      key={log.fileName}
                      onClick={() => setSelectedLog(log)}
                      className="flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm hover:bg-muted/50"
                    >
                      <span className="font-mono">{log.fileName}</span>
                      <Badge variant="outline" className="ml-auto">
                        {log.metadata.totalIterations} iter
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t bg-background/80 p-4 text-xs text-muted-foreground backdrop-blur-sm">
        RLM Visualizer - Recursive Language Models
      </div>
    </div>
  );
}
