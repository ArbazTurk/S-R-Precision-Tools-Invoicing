import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string (YYYY-MM-DD or ISO string) into DD/MM/YYYY format.
 * Returns '-' if the input is invalid or null/undefined.
 * @param dateString The date string to format.
 * @returns The formatted date string or '-'.
 */
export function formatDateDDMMYYYY(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "-";
  }
}
