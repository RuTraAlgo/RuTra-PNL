import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getDayOfWeek } from "@/lib/calculations";
import { Trade } from "@/types/trade";

const INSTRUMENTS = ["NIFTY", "BANKNIFTY", "BTC", "FINNIFTY", "SENSEX"];

interface TradeFormProps {
  onSubmit: (trade: Trade) => void;
  initial?: Trade | null;
  trigger?: React.ReactNode;
}

function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Safely parse a date string. Returns undefined if the date is missing or invalid,
// instead of creating a broken Date object that crashes the app when formatted.
function safeParseDate(dateStr?: string): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr + "T12:00:00");
  return isNaN(parsed.getTime()) ? undefined : parsed;
}

export function TradeForm({ onSubmit, initial, trigger }: TradeFormProps) {
  const [open, setOpen] = useState(false);
  const [calOpen, setCalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(safeParseDate(initial?.date));
  const [instrument, setInstrument] = useState(initial?.instrument || "");
  const [customInstrument, setCustomInstrument] = useState("");
  const [numberOfLots, setNumberOfLots] = useState(initial?.numberOfLots?.toString() || "");
  const [grossPnl, setGrossPnl] = useState(initial?.grossPnl?.toString() || "");
  const [charges, setCharges] = useState(initial?.charges?.toString() || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  const netPnl = (parseFloat(grossPnl) || 0) - (parseFloat(charges) || 0);
  const dateStr = date ? formatDateLocal(date) : "";
  const day = dateStr ? getDayOfWeek(dateStr) : "";
  const finalInstrument = instrument === "CUSTOM" ? customInstrument : instrument;

  function handleDateSelect(d: Date | undefined) {
    setDate(d);
    setCalOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !finalInstrument) return;
    onSubmit({
      id: initial?.id || crypto.randomUUID(),
      date: dateStr,
      day: getDayOfWeek(dateStr),
      instrument: finalInstrument,
      numberOfLots: parseFloat(numberOfLots) || 0,
      grossPnl: parseFloat(grossPnl) || 0,
      charges: parseFloat(charges) || 0,
      netPnl,
      notes,
    });
    setOpen(false);
    if (!initial) {
      setDate(undefined); setInstrument(""); setNumberOfLots("");
      setGrossPnl(""); setCharges("0"); setNotes(""); setCustomInstrument("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Trade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{initial ? "Edit Trade" : "Add New Trade"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date && !isNaN(date.getTime()) ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Day</Label>
              <Input value={day} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Instrument</Label>
            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger><SelectValue placeholder="Select instrument" /></SelectTrigger>
              <SelectContent>
                {INSTRUMENTS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                <SelectItem value="CUSTOM">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {instrument === "CUSTOM" && (
              <Input placeholder="Enter instrument name" value={customInstrument} onChange={e => setCustomInstrument(e.target.value)} className="mt-2" />
            )}
          </div>

          <div className="space-y-2">
            <Label>Number of Lots</Label>
            <Input type="number" value={numberOfLots} onChange={e => setNumberOfLots(e.target.value)} placeholder="e.g. 2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Gross PnL (₹)</Label>
              <Input type="number" step="0.01" value={grossPnl} onChange={e => setGrossPnl(e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div className="space-y-2">
              <Label>Charges (₹)</Label>
              <Input type="number" step="0.01" value={charges} onChange={e => setCharges(e.target.value)} placeholder="e.g. 200" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Net PnL (₹)</Label>
            <Input value={netPnl.toFixed(2)} readOnly className={cn("font-mono", netPnl >= 0 ? "text-profit" : "text-loss")} />
          </div>

          <div className="space-y-2">
            <Label>Notes / Remarks</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Trade remarks..." rows={2} />
          </div>

          <Button type="submit" className="w-full">{initial ? "Update Trade" : "Add Trade"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
