import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatCompactNumber } from "@/lib/format";

/**
 * A single KPI tile. `format` controls how `value` is displayed;
 * `trend` is a signed percentage vs. the prior period — positive renders
 * green with an up-arrow, negative renders red with a down-arrow, so the
 * same component works for metrics where "down" might be good (e.g. a
 * hypothetical "overdue orders" card) just by feeding it the right sign.
 */
const StatCard = ({ label, value, icon: Icon, trend, format = "number", suffix = "", index = 0 }) => {
  const displayValue =
    (format === "currency" ? formatCompactCurrency(value) : formatCompactNumber(value)) + suffix;
  const isPositive = trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
    >
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            {typeof trend === "number" && (
              <span
                className={cn(
                  "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
                  isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}
              >
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
          </div>

          <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">{displayValue}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatCard;
