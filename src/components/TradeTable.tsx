import { useState } from "react";
import { Trade } from "@/types/trade";
import { formatCurrency } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { TradeForm } from "./TradeForm";

interface TradeTableProps {
  trades: Trade[];
  onUpdate: (id: string, trade: Partial<Trade>) => void;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 10;

export function TradeTable({ trades, onUpdate, onDelete }: TradeTableProps) {
  const [page, setPage] = useState(0);
  const sorted = [...trades].sort((a, b) => a.date.localeCompare(b.date));
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = sorted.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  if (trades.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center shadow-sm">
        <p className="text-muted-foreground">No trades yet. Add your first trade to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 text-muted-foreground font-medium">#</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Day</th>
                <th className="text-left p-3 text-muted-foreground font-medium">Instrument</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Lots</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Gross PnL</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Charges</th>
                <th className="text-right p-3 text-muted-foreground font-medium">Net PnL</th>
                <th className="text-center p-3 text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((t, i) => (
                <tr key={t.id} className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${
                  t.netPnl > 0 ? "bg-profit-subtle" : t.netPnl < 0 ? "bg-loss-subtle" : ""
                }`}>
                  <td className="p-3 text-muted-foreground font-mono text-xs">{currentPage * PAGE_SIZE + i + 1}</td>
                  <td className="p-3 font-mono text-xs">{t.date}</td>
                  <td className="p-3 text-xs">{t.day.substring(0, 3)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-accent text-accent-foreground text-xs font-medium">{t.instrument}</span>
                  </td>
                  <td className="p-3 text-right font-mono text-xs">{t.numberOfLots}</td>
                  <td className={`p-3 text-right font-mono text-xs ${t.grossPnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {formatCurrency(t.grossPnl)}
                  </td>
                  <td className="p-3 text-right font-mono text-xs text-loss">
                    -₹{t.charges.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className={`p-3 text-right font-mono text-xs font-semibold ${t.netPnl >= 0 ? "text-profit" : "text-loss"}`}>
                    {formatCurrency(t.netPnl)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TradeForm
                        initial={t}
                        onSubmit={(updated) => onUpdate(t.id, updated)}
                        trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>}
                      />
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(t.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={i === currentPage ? "default" : "outline"}
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setPage(i)}
            >
              {i + 1}
            </Button>
          ))}
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
            Next <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
