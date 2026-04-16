// import { formatStatName, getStatColor } from "@/lib/pokemon-api";

import { getStatColor } from "../utils/utils";

interface StatBarProps {
  name: string;
  value: number;
  compact?: boolean;
}

export function StatBar({ name, value, compact = false }: StatBarProps) {
  const pct = Math.min((value / 195) * 100, 100);
  return (
    <div className={`flex items-center gap-2 ${compact ? "text-s" : "text-sm"}`}>
      <span className="w-12 text-right font-display font-semibold text-muted-foreground">
        {name}
      </span>
      <span className={`w-8 text-right font-display font-bold ${compact ? "text-s" : ""}`}>
        {value}
      </span>
      <div className={`flex-1 h-2 rounded-full bg-secondary overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${getStatColor(name)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
