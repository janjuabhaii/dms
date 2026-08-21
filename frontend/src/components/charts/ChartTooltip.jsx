/**
 * Recharts renders its default tooltip with inline styles that ignore our
 * Tailwind theme entirely. This custom renderer (passed via <Tooltip content={...}/>)
 * uses the same design tokens as the rest of the app so it doesn't look like
 * a foreign element dropped into a themed dashboard.
 */
const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
          <span>{entry.name}:</span>
          <span className="font-medium text-popover-foreground">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChartTooltip;
