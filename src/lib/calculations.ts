import { Trade, DashboardMetrics } from "@/types/trade";

export function calculateMetrics(trades: Trade[]): DashboardMetrics {
  if (trades.length === 0) {
    return {
      totalTradingDays: 0, winningDays: 0, losingDays: 0, winRate: 0,
      totalGrossPnl: 0, totalCharges: 0, totalNetPnl: 0,
      avgWin: 0, avgLoss: 0, largestWin: 0, largestLoss: 0,
      riskRewardRatio: 0, avgDailyPnl: 0, roi: 0, profitFactor: 0,
      expectancy: 0, maxDrawdown: 0, currentDrawdown: 0,
      longestWinStreak: 0, longestLoseStreak: 0,
    };
  }

  const wins = trades.filter(t => t.netPnl > 0);
  const losses = trades.filter(t => t.netPnl < 0);

  const totalGrossPnl = trades.reduce((s, t) => s + t.grossPnl, 0);
  const totalCharges = trades.reduce((s, t) => s + t.charges, 0);
  const totalNetPnl = trades.reduce((s, t) => s + t.netPnl, 0);

  const totalWin = wins.reduce((s, t) => s + t.netPnl, 0);
  const totalLossAmt = Math.abs(losses.reduce((s, t) => s + t.netPnl, 0));

  const avgWin = wins.length > 0 ? totalWin / wins.length : 0;
  const avgLoss = losses.length > 0 ? totalLossAmt / losses.length : 0;

  const netPnls = trades.map(t => t.netPnl);
  const largestWin = netPnls.length > 0 ? Math.max(...netPnls, 0) : 0;
  const largestLoss = netPnls.length > 0 ? Math.min(...netPnls, 0) : 0;

  const totalCapital = trades.reduce((s, t) => s + (t.capitalUsed || 0), 0);

  let peak = 0, cumPnl = 0, maxDD = 0;
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  for (const t of sorted) {
    cumPnl += t.netPnl;
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  }
  const currentDD = peak - cumPnl;

  let winStreak = 0, loseStreak = 0, maxWinStreak = 0, maxLoseStreak = 0;
  for (const t of sorted) {
    if (t.netPnl > 0) { winStreak++; loseStreak = 0; }
    else if (t.netPnl < 0) { loseStreak++; winStreak = 0; }
    else { winStreak = 0; loseStreak = 0; }
    maxWinStreak = Math.max(maxWinStreak, winStreak);
    maxLoseStreak = Math.max(maxLoseStreak, loseStreak);
  }

  return {
    totalTradingDays: trades.length,
    winningDays: wins.length,
    losingDays: losses.length,
    winRate: (wins.length / trades.length) * 100,
    totalGrossPnl, totalCharges, totalNetPnl,
    avgWin, avgLoss, largestWin, largestLoss,
    riskRewardRatio: avgLoss > 0 ? avgWin / avgLoss : 0,
    avgDailyPnl: totalNetPnl / trades.length,
    roi: totalCapital > 0 ? (totalNetPnl / totalCapital) * 100 : 0,
    profitFactor: totalLossAmt > 0 ? totalWin / totalLossAmt : totalWin > 0 ? Infinity : 0,
    expectancy: trades.length > 0
      ? ((wins.length / trades.length) * avgWin) - ((losses.length / trades.length) * avgLoss)
      : 0,
    maxDrawdown: maxDD,
    currentDrawdown: currentDD,
    longestWinStreak: maxWinStreak,
    longestLoseStreak: maxLoseStreak,
  };
}

export function getEquityCurve(trades: Trade[]): { date: string; equity: number }[] {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let cum = 0;
  return sorted.map(t => {
    cum += t.netPnl;
    return { date: t.date, equity: cum };
  });
}

export function getDrawdownCurve(trades: Trade[]): { date: string; drawdown: number }[] {
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  let peak = 0, cum = 0;
  return sorted.map(t => {
    cum += t.netPnl;
    if (cum > peak) peak = cum;
    return { date: t.date, drawdown: -(peak - cum) };
  });
}

export function getMonthlyPnl(trades: Trade[]): { month: string; pnl: number }[] {
  const map: Record<string, number> = {};
  for (const t of trades) {
    const key = t.date.substring(0, 7);
    map[key] = (map[key] || 0) + t.netPnl;
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, pnl]) => ({ month, pnl }));
}

export function getDayWisePerformance(trades: Trade[]): { day: string; avgPnl: number; totalPnl: number; count: number }[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const map: Record<string, number[]> = {};
  days.forEach(d => map[d] = []);
  for (const t of trades) {
    if (map[t.day]) map[t.day].push(t.netPnl);
  }
  return days.filter(d => map[d].length > 0).map(day => {
    const pnls = map[day];
    return {
      day,
      avgPnl: pnls.reduce((s, v) => s + v, 0) / pnls.length,
      totalPnl: pnls.reduce((s, v) => s + v, 0),
      count: pnls.length,
    };
  });
}

export function getInstrumentPerformance(trades: Trade[]): { instrument: string; totalPnl: number; count: number; winRate: number }[] {
  const map: Record<string, Trade[]> = {};
  for (const t of trades) {
    if (!map[t.instrument]) map[t.instrument] = [];
    map[t.instrument].push(t);
  }
  return Object.entries(map).map(([instrument, ts]) => ({
    instrument,
    totalPnl: ts.reduce((s, t) => s + t.netPnl, 0),
    count: ts.length,
    winRate: (ts.filter(t => t.netPnl > 0).length / ts.length) * 100,
  }));
}

export function getDayOfWeek(dateStr: string): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return "";
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  if (isNaN(d.getTime())) return "";
  return days[d.getDay()];
}

export function formatCurrency(val: number): string {
  const sign = val >= 0 ? "+" : "";
  return `${sign}₹${Math.abs(val).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(val: number): string {
  return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
}
