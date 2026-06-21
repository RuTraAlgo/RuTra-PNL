import { Trade } from "@/types/trade";
import { createContext, useContext } from "react";

const STORAGE_KEY = "pnl_tracker_trades";

export function loadTrades(): Trade[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

export function exportCSV(trades: Trade[]): void {
  const headers = ["Date", "Day", "Instrument", "Lots", "Gross PnL", "Charges", "Net PnL", "Capital Used", "Notes"];
  const rows = trades.map(t => [
    t.date, t.day, t.instrument, t.numberOfLots,
    t.grossPnl, t.charges, t.netPnl, t.capitalUsed ?? "", t.notes
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  download(csv, "pnl_data.csv", "text/csv");
}

export function exportJSON(trades: Trade[]): void {
  const json = JSON.stringify(trades, null, 2);
  download(json, "pnl_backup.json", "application/json");
}

export function importJSON(file: File): Promise<Trade[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (Array.isArray(data)) resolve(data);
        else reject(new Error("Invalid format"));
      } catch { reject(new Error("Invalid JSON")); }
    };
    reader.readAsText(file);
  });
}

function download(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
