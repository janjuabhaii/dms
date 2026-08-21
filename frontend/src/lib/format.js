/**
 * PKR currency formatting, since this is a Pakistan-based distribution
 * business (per the Worker/Shop examples: Lahore addresses, PKR-scale prices).
 * Centralized here so every stat card / chart / table formats money identically.
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export const formatCompactCurrency = (value) => `Rs ${formatCompactNumber(value)}`;

/**
 * "2m ago" / "3h ago" / "5d ago" style relative time, used by the
 * notification dropdown. Falls back to a plain date once it's more than a
 * week old, since "9d ago" is less useful than the actual date at that point.
 */
export const formatRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};
