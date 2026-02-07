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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex items-center border-b p-4">
        <h1 className="text-xl font-bold">RLM Visualizer</h1>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4">
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
      <div className="border-t p-4 text-xs text-muted-foreground">
        RLM Visualizer - Recursive Language Models
      </div>
    </div>
  );
}
