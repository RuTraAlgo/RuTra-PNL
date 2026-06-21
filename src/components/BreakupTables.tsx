import { Trade } from "@/types/trade";

interface BreakupTablesProps {
  trades: Trade[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCompact(val: number): string {
  const abs = Math.abs(val);
  const sign = val >= 0 ? "" : "-";
  if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(2)}K`;
  return `${sign}${abs.toFixed(0)}`;
}

const cellBase = "px-4 py-3 text-sm border border-border text-center";
const headerCell = `${cellBase} font-semibold text-muted-foreground bg-muted/40`;
const dataCell = (val: number) =>
  `${cellBase} font-mono ${val > 0 ? "text-profit" : val < 0 ? "text-loss" : "text-muted-foreground"}`;

export function BreakupTables({ trades }: BreakupTablesProps) {
  if (trades.length === 0) return null;

  const years = [...new Set(trades.map(t => t.date.substring(0, 4)))].sort();

  const weeklyData = years.map(year => {
    const yearTrades = trades.filter(t => t.date.startsWith(year));
    const dayMap: Record<string, number> = {};
    DAY_FULL.forEach(d => (dayMap[d] = 0));
    for (const t of yearTrades) {
      dayMap[t.day] = (dayMap[t.day] || 0) + t.netPnl;
    }
    const total = yearTrades.reduce((s, t) => s + t.netPnl, 0);
    return { year, days: DAY_FULL.map(d => dayMap[d]), total };
  });

  const monthlyData = years.map(year => {
    const yearTrades = trades.filter(t => t.date.startsWith(year));
    const monthMap: Record<number, number> = {};
    for (let i = 0; i < 12; i++) monthMap[i] = 0;
    for (const t of yearTrades) {
      const m = parseInt(t.date.substring(5, 7)) - 1;
      monthMap[m] = (monthMap[m] || 0) + t.netPnl;
    }
    const total = yearTrades.reduce((s, t) => s + t.netPnl, 0);
    return { year, months: Array.from({ length: 12 }, (_, i) => monthMap[i]), total };
  });

  return (
    <div className="space-y-6">
      {/* Weekly Breakups */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4">Weekly Breakups</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr>
                <th className={headerCell} style={{ width: "11.11%" }}>Year</th>
                {DAYS.map(d => (
                  <th key={d} className={headerCell} style={{ width: "11.11%" }}>{d}</th>
                ))}
                <th className={headerCell} style={{ width: "11.11%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map(row => (
                <tr key={row.year}>
                  <td className={`${cellBase} font-semibold text-foreground`}>{row.year}</td>
                  {row.days.map((val, i) => (
                    <td key={i} className={dataCell(val)}>
                      {val !== 0 ? formatCompact(val) : ""}
                    </td>
                  ))}
                  <td className={`${dataCell(row.total)} font-semibold`}>
                    {formatCompact(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Breakups */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-bold text-foreground mb-4">Monthly Breakups</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr>
                <th className={headerCell} style={{ width: "7.14%" }}>Year</th>
                {MONTHS_SHORT.map(m => (
                  <th key={m} className={headerCell} style={{ width: "7.14%" }}>{m}</th>
                ))}
                <th className={headerCell} style={{ width: "7.14%" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(row => (
                <tr key={row.year}>
                  <td className={`${cellBase} font-semibold text-foreground`}>{row.year}</td>
                  {row.months.map((val, i) => (
                    <td key={i} className={dataCell(val)}>
                      {val !== 0 ? formatCompact(val) : ""}
                    </td>
                  ))}
                  <td className={`${dataCell(row.total)} font-semibold`}>
                    {formatCompact(row.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
