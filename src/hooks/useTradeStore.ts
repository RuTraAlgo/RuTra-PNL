// ============================================================
// Trade Store — connected to Google Sheets
// All data is loaded from and saved to your Google Sheet
// ============================================================

import { useState, useCallback, useEffect } from "react";
import { Trade, Filters } from "@/types/trade";
import {
  fetchTradesFromSheet,
  addTradeToSheet,
  updateTradeInSheet,
  deleteTradeFromSheet,
  getAppsScriptUrl,
} from "@/lib/googleSheets";
import { loadTrades, saveTrades } from "@/lib/storage";
import { toast } from "sonner";

export function useTradeStore() {
  const [trades, setTrades] = useState<Trade[]>(() => loadTrades());
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    dateFrom: "", dateTo: "", instrument: "", month: "", year: "",
  });

  useEffect(() => {
    const url = getAppsScriptUrl();
    if (!url) return;

    setLoading(true);
    fetchTradesFromSheet()
      .then((sheetTrades) => {
        if (sheetTrades.length > 0) {
          setTrades(sheetTrades);
          saveTrades(sheetTrades);
        }
        setSynced(true);
      })
      .catch(() => {
        toast.error("Could not connect to Google Sheets. Using local data.");
      })
      .finally(() => setLoading(false));
  }, []);

  const addTrade = useCallback(async (trade: Trade) => {
    setTrades(prev => {
      const updated = [...prev, trade];
      saveTrades(updated);
      return updated;
    });

    const url = getAppsScriptUrl();
    if (url) {
      const ok = await addTradeToSheet(trade);
      if (!ok) toast.error("Trade saved locally but failed to sync to Google Sheets");
      else toast.success("Trade saved to Google Sheets ✓");
    } else {
      toast.success("Trade saved locally");
    }
  }, []);

  const updateTrade = useCallback(async (id: string, updated: Partial<Trade>) => {
    let updatedTrade: Trade | undefined;
    setTrades(prev => {
      const newTrades = prev.map(t => {
        if (t.id === id) {
          updatedTrade = { ...t, ...updated };
          return updatedTrade;
        }
        return t;
      });
      saveTrades(newTrades);
      return newTrades;
    });

    const url = getAppsScriptUrl();
    if (url && updatedTrade) {
      const ok = await updateTradeInSheet(updatedTrade);
      if (!ok) toast.error("Updated locally but failed to sync to Google Sheets");
      else toast.success("Trade updated in Google Sheets ✓");
    }
  }, []);

  const deleteTrade = useCallback(async (id: string) => {
    setTrades(prev => {
      const newTrades = prev.filter(t => t.id !== id);
      saveTrades(newTrades);
      return newTrades;
    });

    const url = getAppsScriptUrl();
    if (url) {
      const ok = await deleteTradeFromSheet(id);
      if (!ok) toast.error("Deleted locally but failed to sync to Google Sheets");
      else toast.success("Trade deleted from Google Sheets ✓");
    }
  }, []);

  const setAllTrades = useCallback((newTrades: Trade[]) => {
    setTrades(newTrades);
    saveTrades(newTrades);
  }, []);

  const filteredTrades = trades.filter(t => {
    if (!t.date) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    if (filters.instrument && t.instrument !== filters.instrument) return false;
    if (filters.month && t.date.substring(5, 7) !== filters.month) return false;
    if (filters.year && t.date.substring(0, 4) !== filters.year) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  return {
    trades: filteredTrades,
    allTrades: trades,
    addTrade,
    updateTrade,
    deleteTrade,
    setAllTrades,
    filters,
    setFilters,
    loading,
    synced,
  };
}
