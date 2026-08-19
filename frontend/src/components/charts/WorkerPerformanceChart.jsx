import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ChartTooltip from "./ChartTooltip";
import { formatCompactCurrency } from "@/lib/format";

const WorkerPerformanceChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatCompactCurrency(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fill: "hsl(var(--foreground))", fontSize: 12.5 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCompactCurrency(v)} />}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar dataKey="sales" name="Sales" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill="hsl(var(--primary))" fillOpacity={1 - i * 0.1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WorkerPerformanceChart;
