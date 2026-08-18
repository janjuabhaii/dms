import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classnames intelligently (later classes override earlier
 * conflicting ones) and supports conditional classnames via clsx.
 * Required by every Shadcn UI component generated via the CLI.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
