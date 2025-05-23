"use client";

import { useState, useCallback } from "react";
import { Invoice } from "../types/database"; // Corrected import path

interface UseInvoiceFormDataProps {
  initialData?: Partial<Invoice>;
}

/**
 * Manages invoice form data state (excluding items and clients) and related handlers.
 * @param initialData - Initial invoice data for edit mode.
 * @returns Form data state and handlers.
 */
export const useInvoiceFormData = ({
  initialData,
}: UseInvoiceFormDataProps = {}) => {
  const [formData, setFormData] = useState<Partial<Invoice>>(initialData || {});

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePackingChargesChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      packing_cartage_charges: parseFloat(value) || 0,
    }));
  }, []);

  const handleTaxTypeChange = useCallback((taxType: "CGST_SGST" | "IGST") => {
    setFormData((prev) => {
      // Always respect user's manual selection, even if it contradicts state code logic
      const newState = { ...prev, tax_type: taxType };
      // Preserve existing rates if non-zero, otherwise use defaults
      if (taxType === "CGST_SGST") {
        newState.cgst_rate =
          newState.cgst_rate && newState.cgst_rate > 0 ? newState.cgst_rate : 9;
        newState.sgst_rate =
          newState.sgst_rate && newState.sgst_rate > 0 ? newState.sgst_rate : 9;
        newState.igst_rate = 0; // Reset IGST rate
      } else {
        // IGST
        newState.igst_rate =
          newState.igst_rate && newState.igst_rate > 0
            ? newState.igst_rate
            : 18;
        newState.cgst_rate = 0; // Reset CGST rate
        newState.sgst_rate = 0; // Reset SGST rate
      }
      return newState;
    });
  }, []);

  // This flag helps track if tax type was manually changed by user
  // We'll use this to prevent automatic changes from state code updates

  const handleTaxRateChange = useCallback(
    (field: "cgst_rate" | "sgst_rate" | "igst_rate", value: string) => {
      setFormData((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    },
    []
  );

  return {
    formData,
    setFormData, // Expose setFormData for direct updates if needed (e.g., initialization, calculations)
    handleChange,
    handleSelectChange,
    handlePackingChargesChange,
    handleTaxTypeChange,
    handleTaxRateChange,
  };
};
