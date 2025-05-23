"use client";

import { useMemo } from "react";
import { Invoice } from "../types/database"; // Corrected import path
// Import the local FormInvoiceItem definition if needed, or adjust props
// For calculations, we only need quantity, rate, taxable_value, so a simpler type might suffice
// Let's import the specific types needed from the client utils file
import {
  calculateTotals,
  CalculationState,
  CalculatedTotals,
} from "../lib/invoiceClientUtils"; // Corrected import path

// Define the structure for items expected by this hook (matching CalculationItem in utils)
interface CalculationItemInput {
  quantity: number;
  rate: number;
  taxable_value: number;
}

interface UseInvoiceCalculationsProps {
  items: CalculationItemInput[]; // Expect items with the required calculation fields
  formData: Partial<Pick<Invoice, "packing_cartage_charges" | "tax_type" | "cgst_rate" | "sgst_rate" | "igst_rate">>; // Only relevant formData fields
}

/**
 * Computes invoice totals based on items and relevant form data using memoization.
 * @param items - The list of invoice items (only calculation-relevant fields needed).
 * @param formData - The relevant part of the form data for calculations.
 * @returns The calculated totals object.
 */
export const useInvoiceCalculations = ({ items, formData }: UseInvoiceCalculationsProps): CalculatedTotals => {
  const totals = useMemo(() => {
    // Construct the state needed by the calculateTotals utility function
    const calculationState: CalculationState = {
      packing_cartage_charges: formData.packing_cartage_charges ?? 0,
      tax_type: formData.tax_type as "CGST_SGST" | "IGST" | undefined, // Cast type
      cgst_rate: formData.cgst_rate ?? 0,
      sgst_rate: formData.sgst_rate ?? 0,
      igst_rate: formData.igst_rate ?? 0,
    };
    // Pass items directly as they match the expected structure (CalculationItemInput compatible with CalculationItem)
    return calculateTotals(items, calculationState);
  }, [
    items, // Dependency: Recalculate if items array changes
    formData.packing_cartage_charges,
    formData.tax_type,
    formData.cgst_rate,
    formData.sgst_rate,
    formData.igst_rate,
  ]); // Dependencies: Recalculate if relevant formData fields change

  return totals;
};
