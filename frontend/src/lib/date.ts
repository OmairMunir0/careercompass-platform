import { format, formatDistanceToNow } from "date-fns";

export function formatDate(input: string | number | Date, pattern = "MMM d, yyyy"): string {
  if (!input) return "—";
  const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "—";
  return format(d, pattern);
}

export function formatDateTime(input: string | number | Date, pattern = "MMM d, yyyy, h:mm a"): string {
  if (!input) return "—";
  const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "—";
  return format(d, pattern);
}

export function formatRelative(input: string | number | Date): string {
  if (!input) return "";
  const d = typeof input === "string" || typeof input === "number" ? new Date(input) : input;
  if (isNaN(d.getTime())) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}