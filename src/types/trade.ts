export interface Trade {
  id: string;
  date: string; // ISO date string
  day: string;
  instrument: string;
  numberOfLots: number;
  grossPnl: number;
  charges: number;
  netPnl: number;
  capitalUsed?: number | null;
  notes: string;
}

export interface DashboardMetrics {
  totalTradingDays: number;
  winningDays: number;
  losingDays: number;
  winRate: number;
  totalGrossPnl: number;
  totalCharges: number;
  totalNetPnl: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  riskRewardRatio: number;
  avgDailyPnl: number;
  roi: number;
  profitFactor: number;
  expectancy: number;
  maxDrawdown: number;
  currentDrawdown: number;
  longestWinStreak: number;
  longestLoseStreak: number;
}

export interface Filters {
  dateFrom: string;
  dateTo: string;
  instrument: string;
  month: string;
  year: string;
}
