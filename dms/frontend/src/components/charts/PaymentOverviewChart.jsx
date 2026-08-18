import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatCompactCurrency } from "@/lib/format";

const PaymentOverviewChart = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={80}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={`hsl(var(${entry.colorVar}))`} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip formatter={(v) => formatCompactCurrency(v)} />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-2 space-y-2.5">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `hsl(var(${entry.colorVar}))` }}
              />
              <span className="text-muted-foreground">{entry.name}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-medium text-foreground">{formatCompactCurrency(entry.value)}</span>
              <span className="text-xs text-muted-foreground">
                {((entry.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentOverviewChart;
