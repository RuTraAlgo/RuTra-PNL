import { Trade } from "@/types/trade";
import {
  getEquityCurve, getDrawdownCurve, getMonthlyPnl,
  getDayWisePerformance, getInstrumentPerformance
} from "@/lib/calculations";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  ComposedChart, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LabelList
} from "recharts";

interface ChartsProps {
  trades: Trade[];
}

const GREEN = "hsl(142, 70%, 40%)";
const RED = "hsl(0, 72%, 51%)";
const BLUE = "hsl(217, 91%, 60%)";
const AMBER = "hsl(38, 92%, 50%)";
const PURPLE = "hsl(270, 70%, 60%)";

const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid hsl(220, 13%, 88%)",
  borderRadius: "8px",
  fontSize: 12,
  color: "#1a1a2e",
};
const TICK_STYLE = { fontSize: 10, fill: "hsl(215, 15%, 45%)" };
const GRID_COLOR = "hsl(220, 13%, 90%)";

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{title}</h3>
      <div className="h-[280px]">{children}</div>
    </div>
  );
}

function getPnlVsDdData(trades: Trade[]) {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0, peak = 0;
  return sorted.map(t => {
    cum += t.netPnl;
    if (cum > peak) peak = cum;
    return { date: t.date, pnl: cum, dd: -(peak - cum) };
  });
}

function getPnlVsCharges(trades: Trade[]) {
  const map: Record<string, { netPnl: number; grossPnl: number; charges: number }> = {};
  for (const t of trades) {
    const key = t.date.substring(0, 7);
    if (!map[key]) map[key] = { netPnl: 0, grossPnl: 0, charges: 0 };
    map[key].netPnl += t.netPnl;
    map[key].grossPnl += t.grossPnl;
    map[key].charges += t.charges;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({ month, ...v }));
}

function getWeeklyPnlPie(trades: Trade[]) {
  const map: Record<string, number> = {};
  for (const t of trades) {
    map[t.day] = (map[t.day] || 0) + t.netPnl;
  }
  return Object.entries(map)
    .filter(([, v]) => v !== 0)
    .map(([day, pnl]) => ({ name: day, value: Math.abs(pnl), pnl }));
}

const PIE_COLORS = [GREEN, BLUE, AMBER, PURPLE, RED, "hsl(180, 60%, 50%)", "hsl(320, 60%, 50%)"];

export function Charts({ trades }: ChartsProps) {
  if (trades.length === 0) return null;

  const equity = getEquityCurve(trades);
  const drawdown = getDrawdownCurve(trades);
  const monthly = getMonthlyPnl(trades);
  const dayWise = getDayWisePerformance(trades);
  const instruments = getInstrumentPerformance(trades);
  const pnlVsDd = getPnlVsDdData(trades);
  const pnlVsCharges = getPnlVsCharges(trades);
  const weeklyPie = getWeeklyPnlPie(trades);

  const totalNetPnl = trades.reduce((s, t) => s + t.netPnl, 0);
  const totalCharges = trades.reduce((s, t) => s + t.charges, 0);
  const summaryPie = [
    { name: "Net PnL", value: Math.abs(totalNetPnl) },
    { name: "Charges", value: totalCharges },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Equity Curve - straight line */}
      <ChartCard title="Net PNL Equity">
        <ResponsiveContainer>
          <LineChart data={equity}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="date" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="linear" dataKey="equity" stroke={GREEN} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Drawdown */}
      <ChartCard title="Drawdown">
        <ResponsiveContainer>
          <AreaChart data={drawdown}>
            <defs>
              <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={RED} stopOpacity={0.3} />
                <stop offset="95%" stopColor={RED} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="date" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="linear" dataKey="drawdown" stroke={RED} fill="url(#ddGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* PnL vs DD */}
      <ChartCard title="PnL vs Drawdown">
        <ResponsiveContainer>
          <ComposedChart data={pnlVsDd}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="date" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="linear" dataKey="pnl" name="PnL" stroke={GREEN} strokeWidth={2} dot={false} />
            <Area type="linear" dataKey="dd" name="Drawdown" stroke={RED} fill="url(#ddGrad)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Monthly PnL */}
      <ChartCard title="Monthly PNL">
        <ResponsiveContainer>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="month" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="pnl" radius={[4, 4, 0, 0]} barSize={28} maxBarSize={32}>
              {monthly.map((entry, i) => (
                <Cell key={i} fill={entry.pnl >= 0 ? GREEN : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* PnL vs Charges */}
      <ChartCard title="PNL vs Charges">
        <ResponsiveContainer>
          <BarChart data={pnlVsCharges}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="month" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="netPnl" name="Net PnL" radius={[4, 4, 0, 0]} barSize={24} maxBarSize={28}>
              {pnlVsCharges.map((entry, i) => (
                <Cell key={i} fill={entry.netPnl >= 0 ? GREEN : RED} />
              ))}
            </Bar>
            <Bar dataKey="charges" name="Charges" fill={AMBER} radius={[4, 4, 0, 0]} barSize={24} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Day-wise Performance */}
      <ChartCard title="Day-wise Performance">
        <ResponsiveContainer>
          <BarChart data={dayWise}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="day" tick={TICK_STYLE} />
            <YAxis tick={TICK_STYLE} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="totalPnl" name="Total PnL" radius={[4, 4, 0, 0]} barSize={28} maxBarSize={32}>
              {dayWise.map((entry, i) => (
                <Cell key={i} fill={entry.totalPnl >= 0 ? GREEN : RED} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Weekly PNL Pie - 3D style */}
      <ChartCard title="Weekly PNL Distribution">
        <ResponsiveContainer>
          <PieChart>
            <defs>
              <filter id="pie3d1">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            <Pie
              data={weeklyPie}
              cx="50%"
              cy="52%"
              outerRadius={95}
              innerRadius={40}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              strokeWidth={2}
              stroke="#fff"
              style={{ filter: "url(#pie3d1)" }}
            >
              {weeklyPie.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* PnL vs Charges Summary Pie - 3D style */}
      <ChartCard title="PNL vs Charges Summary">
        <ResponsiveContainer>
          <PieChart>
            <defs>
              <filter id="pie3d2">
                <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.2" />
              </filter>
            </defs>
            <Pie
              data={summaryPie}
              cx="50%"
              cy="52%"
              outerRadius={95}
              innerRadius={40}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              strokeWidth={2}
              stroke="#fff"
              style={{ filter: "url(#pie3d2)" }}
            >
              <Cell fill={GREEN} />
              <Cell fill={RED} />
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Instrument Performance - full width */}
      <div className="lg:col-span-2">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">Instrument Performance</h3>
          <div className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={instruments} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <XAxis type="number" tick={TICK_STYLE} />
                <YAxis type="category" dataKey="instrument" tick={TICK_STYLE} width={80} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="totalPnl" name="PnL" radius={[0, 4, 4, 0]} barSize={24} maxBarSize={28}>
                  <LabelList
                    dataKey="totalPnl"
                    position="right"
                    formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`}
                    style={{ fontSize: 11, fontWeight: 600 }}
                  />
                  {instruments.map((entry, i) => (
                    <Cell key={i} fill={entry.totalPnl >= 0 ? GREEN : RED} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
