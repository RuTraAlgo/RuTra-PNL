import { DashboardMetrics } from "@/types/trade";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import {
  TrendingUp, TrendingDown, Target, BarChart3, Award, AlertTriangle,
  Activity, DollarSign, Flame, Shield, Zap
} from "lucide-react";

interface MetricsGridProps {
  metrics: DashboardMetrics;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  type?: "neutral" | "profit" | "loss";
}

function MetricCard({ label, value, icon, type = "neutral" }: MetricCardProps) {
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${
      type === "profit" ? "bg-profit-subtle border-profit glow-profit" :
      type === "loss" ? "bg-loss-subtle border-loss glow-loss" :
      "bg-card border-border"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <p className={`text-lg font-semibold font-mono ${
        type === "profit" ? "text-profit" : type === "loss" ? "text-loss" : "text-foreground"
      }`}>
        {value}
      </p>
    </div>
  );
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const m = metrics;

  const avgDailyLoss = m.losingDays > 0 ? -(m.avgLoss) : 0;
  const expectancyRatio = m.avgLoss > 0 ? ((m.winRate / 100) * m.avgWin - ((100 - m.winRate) / 100) * m.avgLoss) / m.avgLoss : 0;

  // First row: 4 main cards
  const topCards: MetricCardProps[] = [
    { label: "Total Gross PnL", value: formatCurrency(m.totalGrossPnl), icon: <DollarSign className="h-4 w-4" />, type: m.totalGrossPnl >= 0 ? "profit" : "loss" },
    { label: "Total Charges", value: `₹${m.totalCharges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, icon: <AlertTriangle className="h-4 w-4" />, type: "loss" },
    { label: "Total Net PnL", value: formatCurrency(m.totalNetPnl), icon: <Activity className="h-4 w-4" />, type: m.totalNetPnl >= 0 ? "profit" : "loss" },
    { label: "Win Rate", value: formatPercent(m.winRate), icon: <Target className="h-4 w-4" />, type: m.winRate >= 50 ? "profit" : "loss" },
    { label: "Expectancy Ratio", value: expectancyRatio.toFixed(2), icon: <Target className="h-4 w-4" />, type: expectancyRatio >= 0 ? "profit" : "loss" },
  ];

  const cards: MetricCardProps[] = [
    { label: "Trading Days", value: m.totalTradingDays.toString(), icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Winning Days", value: m.winningDays.toString(), icon: <TrendingUp className="h-4 w-4" />, type: "profit" },
    { label: "Losing Days", value: m.losingDays.toString(), icon: <TrendingDown className="h-4 w-4" />, type: "loss" },
    { label: "Avg Win", value: formatCurrency(m.avgWin), icon: <TrendingUp className="h-4 w-4" />, type: "profit" },
    { label: "Avg Loss", value: formatCurrency(-m.avgLoss), icon: <TrendingDown className="h-4 w-4" />, type: "loss" },
    { label: "Largest Win", value: formatCurrency(m.largestWin), icon: <Award className="h-4 w-4" />, type: "profit" },
    { label: "Largest Loss", value: formatCurrency(m.largestLoss), icon: <AlertTriangle className="h-4 w-4" />, type: "loss" },
    { label: "Risk Reward", value: m.riskRewardRatio.toFixed(2), icon: <Shield className="h-4 w-4" /> },
    { label: "Avg Daily PnL", value: formatCurrency(m.avgDailyPnl), icon: <BarChart3 className="h-4 w-4" />, type: m.avgDailyPnl >= 0 ? "profit" : "loss" },
    { label: "Avg Daily Loss", value: formatCurrency(avgDailyLoss), icon: <TrendingDown className="h-4 w-4" />, type: "loss" },
    { label: "Max Drawdown", value: formatCurrency(-m.maxDrawdown), icon: <TrendingDown className="h-4 w-4" />, type: "loss" },
    { label: "Current DD", value: formatCurrency(-m.currentDrawdown), icon: <TrendingDown className="h-4 w-4" />, type: m.currentDrawdown > 0 ? "loss" : "neutral" },
    { label: "Max Winning Streak", value: m.longestWinStreak.toString(), icon: <Flame className="h-4 w-4" />, type: "profit" },
    { label: "Max Losing Streak", value: m.longestLoseStreak.toString(), icon: <Flame className="h-4 w-4" />, type: "loss" },
  ];

  return (
    <div className="space-y-3">
      {/* Top row: 4 main cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {topCards.map(c => <MetricCard key={c.label} {...c} />)}
      </div>
      {/* Remaining cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {cards.map(c => <MetricCard key={c.label} {...c} />)}
      </div>
    </div>
  );
}
