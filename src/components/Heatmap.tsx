import { useState } from "react";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/lib/calculations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeatmapProps {
  trades: Trade[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(pnl: number, min: number, max: number): string {
  if (pnl > 0) {
    const r = max > 0 ? pnl / max : 0;
    if (r > 0.75) return "#196127";
    if (r > 0.5) return "#239a3b";
    if (r > 0.25) return "#7bc96f";
    return "#c6e48b";
  } else {
    const r = min < 0 ? Math.abs(pnl) / Math.abs(min) : 0;
    if (r > 0.75) return "#b71c1c";
    if (r > 0.5) return "#e53935";
    if (r > 0.25) return "#ef9a9a";
    return "#ffcdd2";
  }
}

interface MonthGrid {
  weeks: (string | null)[][];
}

function buildMonthGrid(year: number, month: number): MonthGrid {
  const weeks: (string | null)[][] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let currentWeek: (string | null)[] = new Array(7).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

    if (d > 1 && dow === 0) {
      weeks.push(currentWeek);
      currentWeek = new Array(7).fill(null);
    }
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    currentWeek[dow] = dateStr;
  }
  weeks.push(currentWeek);
  return { weeks };
}

const CELL_SIZE = 14;
const CELL_GAP = 3;

export function Heatmap({ trades }: HeatmapProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (trades.length === 0) return null;

  const byDateNet: Record<string, number> = {};
  const byDateGross: Record<string, number> = {};
  const byDateCharges: Record<string, number> = {};
  for (const t of trades) {
    byDateNet[t.date] = (byDateNet[t.date] || 0) + t.netPnl;
    byDateGross[t.date] = (byDateGross[t.date] || 0) + t.grossPnl;
    byDateCharges[t.date] = (byDateCharges[t.date] || 0) + t.charges;
  }

  const allPnls = Object.values(byDateNet);
  const min = Math.min(...allPnls, 0);
  const max = Math.max(...allPnls, 0);

  const years = [...new Set(trades.map(t => t.date.substring(0, 4)))].sort();

  // Compute monthly summaries
  const monthlySummary: Record<string, { netPnl: number; grossPnl: number; charges: number }> = {};
  for (const t of trades) {
    const key = t.date.substring(0, 7); // YYYY-MM
    if (!monthlySummary[key]) monthlySummary[key] = { netPnl: 0, grossPnl: 0, charges: 0 };
    monthlySummary[key].netPnl += t.netPnl;
    monthlySummary[key].grossPnl += t.grossPnl;
    monthlySummary[key].charges += t.charges;
  }

  // Auto-select first available month if none selected
  const availableMonths = Object.keys(monthlySummary).sort();
  const activeMonth = selectedMonth && monthlySummary[selectedMonth] ? selectedMonth : availableMonths[0] || null;

  const activeData = activeMonth ? monthlySummary[activeMonth] : null;
  const activeLabel = activeMonth
    ? `${MONTHS[parseInt(activeMonth.split("-")[1]) - 1]}-${activeMonth.split("-")[0]}`
    : "";

  return (
    <TooltipProvider delayDuration={100}>
      <div className="rounded-lg border border-border bg-card p-5 space-y-8 shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">PnL Heatmap</h3>

        {years.map(year => {
          const yearInt = parseInt(year);
          return (
            <div key={year} className="space-y-3">
              <h4 className="text-base font-bold text-foreground">{year}</h4>
              <div className="overflow-x-auto">
                <div className="flex gap-4 items-start flex-wrap">
                  {Array.from({ length: 12 }, (_, mi) => {
                    const grid = buildMonthGrid(yearInt, mi);
                    const monthKey = `${year}-${String(mi + 1).padStart(2, "0")}`;
                    const isSelected = activeMonth === monthKey;
                    return (
                      <div key={mi} className="flex flex-col items-center">
                        <div className="flex" style={{ gap: CELL_GAP }}>
                          {grid.weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col" style={{ gap: CELL_GAP }}>
                              {week.map((dateStr, di) => {
                                if (!dateStr) {
                                  return <div key={di} style={{ width: CELL_SIZE, height: CELL_SIZE }} />;
                                }
                                const netPnl = byDateNet[dateStr] ?? null;
                                const grossPnl = byDateGross[dateStr] ?? null;
                                const bg = netPnl !== null ? getColor(netPnl, min, max) : "#ebedf0";

                                return (
                                  <Tooltip key={di}>
                                    <TooltipTrigger asChild>
                                      <div
                                        className="rounded-[2px] cursor-default transition-all duration-150 hover:ring-1 hover:ring-foreground/40 hover:scale-[1.3]"
                                        style={{
                                          width: CELL_SIZE,
                                          height: CELL_SIZE,
                                          backgroundColor: bg,
                                        }}
                                      />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">
                                      <p className="font-semibold">{dateStr}</p>
                                      {netPnl !== null ? (
                                        <>
                                          <p>Gross: {formatCurrency(grossPnl!)}</p>
                                          <p>Net: {formatCurrency(netPnl)}</p>
                                        </>
                                      ) : (
                                        <p className="text-muted-foreground">No trades</p>
                                      )}
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setSelectedMonth(monthKey)}
                          className={`text-[9px] mt-1 px-1 rounded transition-colors ${
                            isSelected
                              ? "text-blue-600 font-bold bg-blue-50"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {MONTHS[mi]}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Summary Bar */}
        {activeData && (
          <div className="flex items-center gap-3 text-sm border-t border-border pt-4 flex-wrap">
            <span className="font-medium text-foreground">Net realised P&L</span>
            <span className="text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded text-xs">{activeLabel}</span>
            <span className="text-muted-foreground">F&O:</span>
            <span className={`font-semibold ${activeData.netPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(activeData.netPnl)}
            </span>
            <span className="text-muted-foreground">Charges:</span>
            <span className="font-semibold text-foreground">
              {formatCurrency(-Math.abs(activeData.charges))}
            </span>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Loss</span>
          {["#b71c1c", "#e53935", "#ef9a9a", "#ffcdd2"].map(c => (
            <div key={c} className="rounded-[2px]" style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: c }} />
          ))}
          <div className="rounded-[2px]" style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: "#ebedf0" }} />
          {["#c6e48b", "#7bc96f", "#239a3b", "#196127"].map(c => (
            <div key={c} className="rounded-[2px]" style={{ width: CELL_SIZE, height: CELL_SIZE, backgroundColor: c }} />
          ))}
          <span>Profit</span>
        </div>
      </div>
    </TooltipProvider>
  );
}
