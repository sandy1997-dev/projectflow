import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, isToday, isTomorrow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, pattern = "MMM d, yyyy"): string {
  return format(new Date(date), pattern);
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isOverdue(date: Date | string): boolean {
  return isPast(new Date(date)) && !isToday(new Date(date));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const PRIORITY_COLORS = {
  LOW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  MEDIUM: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const STATUS_COLORS = {
  TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  IN_REVIEW: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  DONE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

export function calculateProgress(items: { isCompleted: boolean }[]): number {
  if (!items.length) return 0;
  return Math.round((items.filter((i) => i.isCompleted).length / items.length) * 100);
}
