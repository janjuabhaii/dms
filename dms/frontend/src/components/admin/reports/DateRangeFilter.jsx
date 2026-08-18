import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 12 months", days: 365 },
];

const toISODate = (date) => date.toISOString().split("T")[0];

const DateRangeFilter = ({ from, to, onChange }) => {
  const applyPreset = (days) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - Number(days));
    onChange({ from: toISODate(from), to: toISODate(to) });
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select onValueChange={applyPreset}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Quick range" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.days} value={String(p.days)}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input
          type="date"
          value={from}
          max={to}
          onChange={(e) => onChange({ from: e.target.value, to })}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input
          type="date"
          value={to}
          min={from}
          max={toISODate(new Date())}
          onChange={(e) => onChange({ from, to: e.target.value })}
          className="w-[150px]"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
