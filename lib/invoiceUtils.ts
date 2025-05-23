// Utility functions for invoice operations
import { createClient } from "@/utils/supabase/server";

/**
 * Generates the next invoice number in sequence
 * Format: SRPT001, SRPT002, etc.
 * @returns Promise with the next invoice number
 */
export async function fetchNextInvoiceNumber(): Promise<string> {
  const supabase = await createClient();

  // Fetch the highest invoice number from the database
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .order("invoice_number", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error fetching last invoice number:", error);
    // Default to SRPT001 if there's an error
    return "SRPT001";
  }

  if (!data || data.length === 0) {
    // No invoices yet, start with SRPT001
    return "SRPT001";
  }

  // Extract the numeric part and increment
  const lastInvoiceNumber = data[0].invoice_number;
  const prefix = "SRPT";
  const numericPart = lastInvoiceNumber.replace(prefix, "");
  const nextNum = parseInt(numericPart, 10) + 1;

  // Format with leading zeros (3 digits)
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

/**
 * Converts a number to words for invoice total
 * @param amount The amount to convert to words
 * @returns The amount in words
 */
export function amountToWords(amount: number): string {
  // This is a placeholder. You'll need to install and use a library like 'number-to-words'
  // or implement a custom function to convert numbers to words
  // Example implementation would go here

  // For now, returning a placeholder message
  return `${amount} (Amount in words to be implemented)`;
}
