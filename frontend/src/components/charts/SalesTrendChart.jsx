import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatCompactCurrency } from "@/lib/format";

const SalesTrendChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="colorSalesTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactCurrency(v)}
          width={64}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCompactCurrency(v)} />}
          cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.2, strokeWidth: 24 }}
        />
        <Area
          type="monotone"
          dataKey="totalSales"
          name="Sales"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#colorSalesTrend)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SalesTrendChart;
