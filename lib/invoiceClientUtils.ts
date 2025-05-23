"use client";

import { companyProfile } from "@/config/companyProfile"; // Keep import for validateGSTIN context if needed

// Interface for items used within calculations (only fields needed by calculateTotals)
interface CalculationItem {
  quantity: number;
  rate: number;
  taxable_value: number;
}

// Interface for the state slice needed by calculateTotals
export interface CalculationState {
  packing_cartage_charges?: number | null;
  tax_type?: string | null | undefined; // Allow string or null/undefined
  cgst_rate?: number | null;
  sgst_rate?: number | null;
  igst_rate?: number | null;
}

// Interface for the results of the calculation
export interface CalculatedTotals {
  total_amount_before_tax: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_amount_after_tax: number;
}

/**
 * Calculates various invoice totals based on items and form data.
 */
export const calculateTotals = (
  items: CalculationItem[], // Use the simpler interface
  state: CalculationState
): CalculatedTotals => {
  const goodsTotal = items.reduce(
    (sum, item) => sum + (item.taxable_value || 0),
    0
  );
  const packingCharges = Number(state.packing_cartage_charges) || 0;
  const taxableAmount = goodsTotal + packingCharges;

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  const taxType = state.tax_type || "IGST"; // Default if not set

  if (taxType === "CGST_SGST") {
    const cgstRate = Number(state.cgst_rate) || 0;
    const sgstRate = Number(state.sgst_rate) || 0;
    cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
    sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
  } else {
    // IGST
    const igstRate = Number(state.igst_rate) || 0;
    igstAmount = Number(((taxableAmount * igstRate) / 100).toFixed(2));
  }

  const totalAfterTax = Math.round(
    Number((taxableAmount + cgstAmount + sgstAmount + igstAmount).toFixed(2)) // Use individual amounts
  );

  return {
    total_amount_before_tax: Number(taxableAmount.toFixed(2)), // Changed to include packing charges
    cgst_amount: cgstAmount,
    sgst_amount: sgstAmount,
    igst_amount: igstAmount,
    total_amount_after_tax: totalAfterTax,
  };
};

/**
 * Converts a number amount to words representation (e.g., "Rupees One Hundred Only").
 * Uses dynamic import for compatibility with ES Modules.
 */
export const amountToWords = async (amount: number): Promise<string> => {
  try {
    // Dynamically import the library
    const numberToWords = await import("number-to-words");

    if (typeof amount !== "number" || isNaN(amount)) {
      return "Invalid amount";
    }

    const roundedAmount = parseFloat(amount.toFixed(2)); // Ensure max 2 decimal places
    const wholePart = Math.floor(roundedAmount);
    const decimalPart = Math.round((roundedAmount - wholePart) * 100);

    let result = numberToWords.toWords(wholePart);
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);

    if (decimalPart > 0) {
      // Use .default if the dynamic import wraps the module
      const toWords = numberToWords.default?.toWords || numberToWords.toWords;
      const paiseWords = toWords(decimalPart);
      result += ` and ${paiseWords.charAt(0).toUpperCase() + paiseWords.slice(1)} Paise`;
    }

    return `Rupees ${result} Only`;
  } catch (error) {
    console.error("Error converting amount to words:", error);
    // Fallback or error indication
    return `Rupees ${amount.toFixed(2)} (Error in conversion)`;
  }
};

/**
 * Validates a GSTIN string.
 * Allows empty/null/undefined for Unregistered dealers.
 */
export const validateGSTIN = (
  gstin: string | undefined | null
): { valid: boolean; message?: string } => {
  if (!gstin) return { valid: true }; // Allow empty for unregistered clients

  const cleanedGstin = gstin.trim().toUpperCase();
  // Regex updated for standard GSTIN format
  const regex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regex.test(cleanedGstin)) {
    return { valid: false, message: `Invalid GSTIN format: ${gstin}` };
  }

  // Optional: Validate state code based on company profile (can be enabled if needed)
  // const stateCode = cleanedGstin.substring(0, 2);
  // if (stateCode !== companyProfile.stateCode) {
  //   return { valid: false, message: `GSTIN State code (${stateCode}) does not match company state (${companyProfile.stateCode})` };
  // }

  return { valid: true };
};
