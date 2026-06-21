import { useRef } from "react";
import { useTradeStore } from "@/hooks/useTradeStore";
import { calculateMetrics } from "@/lib/calculations";
import { exportCSV, exportJSON, importJSON } from "@/lib/storage";
import { TradeForm } from "@/components/TradeForm";
import { MetricsGrid } from "@/components/MetricsGrid";
import { TradeTable } from "@/components/TradeTable";
import { Charts } from "@/components/Charts";
import { Heatmap } from "@/components/Heatmap";
import { BreakupTables } from "@/components/BreakupTables";
import { FilterBar } from "@/components/FilterBar";
import { SetupBanner } from "@/components/SetupBanner";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileDown, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveTrades } from "@/lib/storage";

export default function Index() {
  const {
    trades, allTrades, addTrade, updateTrade, deleteTrade,
    setAllTrades, filters, setFilters, loading, synced
  } = useTradeStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const metrics = calculateMetrics(trades);
  const instruments = [...new Set(allTrades.map(t => t.instrument))];
  const years = [...new Set(allTrades.map(t => t.date.substring(0, 4)))].sort();

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importJSON(file);
      setAllTrades(data);
      toast.success(`Imported ${data.length} trades`);
    } catch {
      toast.error("Failed to import file");
    }
    e.target.value = "";
  }

  async function handleRefresh() {
    const { fetchTradesFromSheet } = await import("@/lib/googleSheets");
    const sheetTrades = await fetchTradesFromSheet();
    if (sheetTrades.length > 0) {
      setAllTrades(sheetTrades);
      saveTrades(sheetTrades);
      toast.success(`Refreshed — ${sheetTrades.length} trades loaded`);
    } else {
      toast.info("No trades found in Google Sheets");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">RuTra Overall PNL</h1>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            {!loading && synced && (
              <span className="text-xs text-green-500 font-medium">● Synced</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleRefresh} className="gap-1.5 text-xs" title="Refresh from Google Sheets">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={() => exportCSV(trades)} className="gap-1.5 text-xs">
              <FileDown className="h-3.5 w-3.5" /> CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={() => exportJSON(allTrades)} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" /> Backup
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5 text-xs">
              <Upload className="h-3.5 w-3.5" /> Restore
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <TradeForm onSubmit={addTrade} />
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <SetupBanner onSetup={() => window.location.reload()} />

        {loading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading trades from Google Sheets...</span>
          </div>
        )}

        {!loading && (
          <>
            <MetricsGrid metrics={metrics} />
            <div className="rounded-lg border border-border bg-card p-4">
              <FilterBar filters={filters} setFilters={setFilters} instruments={instruments} years={years} />
            </div>
            <Heatmap trades={trades} />
            <Charts trades={trades} />
            <BreakupTables trades={trades} />
            <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Trade Log ({trades.length} entries)
              </h2>
              <TradeTable trades={trades} onUpdate={updateTrade} onDelete={deleteTrade} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
