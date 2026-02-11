"use client";

import { cn } from "@/lib/utils";

const variantClasses: Record<string, string> = {
  cyan: "border-cyan-500/30 bg-cyan-500/5",
  green: "border-emerald-500/30 bg-emerald-500/5",
  magenta: "border-fuchsia-500/30 bg-fuchsia-500/5",
  yellow: "border-amber-500/30 bg-amber-500/5",
  red: "border-red-500/30 bg-red-500/5",
};

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  variant: "cyan" | "green" | "magenta" | "yellow" | "red";
}

export function StatsCard({ label, value, icon: Icon, variant }: StatsCardProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-3", variantClasses[variant])}>
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-mono text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}
