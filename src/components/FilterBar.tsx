import { Filters } from "@/types/trade";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  instruments: string[];
  years: string[];
}

const MONTHS = [
  { value: "01", label: "January" }, { value: "02", label: "February" },
  { value: "03", label: "March" }, { value: "04", label: "April" },
  { value: "05", label: "May" }, { value: "06", label: "June" },
  { value: "07", label: "July" }, { value: "08", label: "August" },
  { value: "09", label: "September" }, { value: "10", label: "October" },
  { value: "11", label: "November" }, { value: "12", label: "December" },
];

export function FilterBar({ filters, setFilters, instruments, years }: FilterBarProps) {
  const hasFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input type="date" value={filters.dateFrom} onChange={e => setFilters({ ...filters, dateFrom: e.target.value })} className="w-[150px] text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input type="date" value={filters.dateTo} onChange={e => setFilters({ ...filters, dateTo: e.target.value })} className="w-[150px] text-xs" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Instrument</Label>
        <Select value={filters.instrument || "all"} onValueChange={v => setFilters({ ...filters, instrument: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[140px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {instruments.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Month</Label>
        <Select value={filters.month || "all"} onValueChange={v => setFilters({ ...filters, month: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[140px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {MONTHS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Year</Label>
        <Select value={filters.year || "all"} onValueChange={v => setFilters({ ...filters, year: v === "all" ? "" : v })}>
          <SelectTrigger className="w-[100px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => setFilters({ dateFrom: "", dateTo: "", instrument: "", month: "", year: "" })} className="gap-1 text-xs">
          <X className="h-3 w-3" /> Clear
        </Button>
      )}
    </div>
  );
}
