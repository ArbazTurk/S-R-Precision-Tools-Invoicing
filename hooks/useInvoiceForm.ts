"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Keep router import if needed by submission or elsewhere
import { Invoice, InvoiceItem, Client, Product } from "../types/database"; // Corrected import path
import { useInvoiceFormData } from "./useInvoiceFormData";
import { useInvoiceItems, FormInvoiceItem } from "./useInvoiceItems"; // Import FormInvoiceItem from here
import { useClientSelection } from "./useClientSelection";
import { useTransportMode } from "./useTransportMode";
import { useInvoiceCalculations } from "./useInvoiceCalculations";
import { useInvoiceSubmission } from "./useInvoiceSubmission";
import { useDataFetchers } from "./useDataFetchers";
import { amountToWords } from "../lib/invoiceClientUtils"; // Import amountToWords utility

// Define the structure for the full invoice data fetched for editing, including relations
// This type might be better placed in types/database.ts if used elsewhere
export type FullInvoiceForEdit = Invoice & {
  billed_client: Client | null;
  shipped_client: Client | null;
  invoice_items: (InvoiceItem & { products: Product | null })[];
};

interface UseInvoiceFormProps {
  initialInvoiceData?: FullInvoiceForEdit;
  mode: "create" | "edit";
}

/**
 * Composes various smaller hooks to manage the state and logic for the invoice form.
 * Provides a consistent interface for the InvoiceForm component.
 * @param initialInvoiceData - The full invoice data for editing, including related clients and items.
 * @param mode - "create" or "edit" mode.
 * @returns An object containing all necessary state and handlers for the invoice form.
 */
export const useInvoiceForm = ({
  initialInvoiceData,
  mode,
}: UseInvoiceFormProps) => {
  const [loading, setLoading] = useState(mode === "edit" || mode === "create"); // Loading during initial setup
  const {
    fetchNextInvoiceNumber,
    fetchClientSuggestions,
    fetchProductSuggestions,
  } = useDataFetchers();

  // Instantiate the smaller hooks, passing initial data and callbacks

  const formDataHook = useInvoiceFormData({
    // Pass only the relevant Invoice fields, excluding relations
    initialData: initialInvoiceData
      ? (({ billed_client, shipped_client, invoice_items, ...rest }) => rest)(
          initialInvoiceData
        )
      : undefined,
  });

  const itemsHook = useInvoiceItems({
    // Map initial invoice_items to FormInvoiceItem structure
    initialItems: initialInvoiceData?.invoice_items.map((item) => ({
      id: item.id,
      product_id: item.product_id,
      name: item.products?.name || null, // Add product name from related product
      hsn_sac_code: item.products?.hsn_sac_code || null,
      quantity: item.quantity,
      rate: item.rate,
      taxable_value: item.taxable_value,
    })),
    // Create initial product data map from related products
    initialItemProductDataMap: initialInvoiceData?.invoice_items.reduce(
      (map, item, index) => {
        if (item.products) {
          map[index] = item.products;
        }
        return map;
      },
      {} as Record<string, Product | null>
    ),
  });

  // Track if user has manually changed tax type to prevent auto-updates from state code changes
  const [userChangedTaxType, setUserChangedTaxType] = useState(mode === "edit");

  const clientSelectionHook = useClientSelection({
    initialBilledClient: initialInvoiceData?.billed_client,
    initialShippedClient: initialInvoiceData?.shipped_client,
    initialBilledId: initialInvoiceData?.billed_to_client_id,
    initialShippedId: initialInvoiceData?.shipped_to_client_id,
    // Callback to update formData when client selection affects tax type
    onTaxTypeUpdate: (taxType, rates) => {
      // Only update tax type automatically if user hasn't manually changed it
      // AND we're not in edit mode (preserve original tax type in edit mode)
      if (!userChangedTaxType && mode !== "edit") {
        // Update formData only if tax type or relevant rates actually change
        formDataHook.setFormData((prev) => {
          const needsUpdate =
            prev.tax_type !== taxType ||
            (taxType === "CGST_SGST" &&
              (prev.cgst_rate !== rates.cgst ||
                prev.sgst_rate !== rates.sgst)) ||
            (taxType === "IGST" && prev.igst_rate !== rates.igst);

          if (needsUpdate) {
            // If changed, return new state object with updated tax info
            return {
              ...prev,
              tax_type: taxType,
              cgst_rate: rates.cgst,
              sgst_rate: rates.sgst,
              igst_rate: rates.igst,
            };
          }
          // If no change needed, return the previous state reference to prevent loop
          return prev;
        });
      }
    },
  });

  // Override the original handleTaxTypeChange to track user manual changes
  const originalHandleTaxTypeChange = formDataHook.handleTaxTypeChange;
  formDataHook.handleTaxTypeChange = (taxType: "CGST_SGST" | "IGST") => {
    // Mark that user has manually changed the tax type
    setUserChangedTaxType(true);
    // Call the original handler
    originalHandleTaxTypeChange(taxType);
  };

  const transportHook = useTransportMode(initialInvoiceData?.transport_mode); // Pass initial transport mode

  const calculationsHook = useInvoiceCalculations({
    items: itemsHook.items, // Pass current items
    formData: formDataHook.formData, // Pass current form data
  });

  const submissionHook = useInvoiceSubmission({
    mode,
    invoiceId: initialInvoiceData?.id,
  });

  // --- Initialization Effect ---
  useEffect(() => {
    const initializeForm = async () => {
      setLoading(true);
      if (mode === "edit" && initialInvoiceData) {
        // Data is already passed as initial props to hooks above.
        // We might need to ensure state is fully set, though useState initializers should handle it.
        // Example: If createEmptyItemRow logic needs adjustment for edit mode.
        if (initialInvoiceData.invoice_items.length === 0) {
          itemsHook.setItems([itemsHook.createEmptyItemRow()]); // Ensure at least one row in edit mode if items were empty
        }
      } else if (mode === "create") {
        // Fetch next invoice number and set defaults
        const invoiceNumber = await fetchNextInvoiceNumber();
        formDataHook.setFormData({
          invoice_number: invoiceNumber || "INV0001", // Fallback number
          invoice_date: new Date().toISOString().split("T")[0],
          packing_cartage_charges: 0,
          cgst_rate: 9, // Default rates
          sgst_rate: 9,
          igst_rate: 0,
          tax_type: "CGST_SGST", // Default tax type
        });
        itemsHook.setItems([itemsHook.createEmptyItemRow()]); // Ensure one empty item row
        itemsHook.setItemProductDataMap({}); // Clear product map
        clientSelectionHook.setDisplayedBillingDetails({}); // Clear client details
        clientSelectionHook.setDisplayedShippingDetails({});
        clientSelectionHook.setSelectedBilledClientId(null);
        clientSelectionHook.setSelectedShippedClientId(null);
        clientSelectionHook.setSameAsBilledTo(false);
        transportHook.setSelectedTransportMode("By Road"); // Reset transport mode
        transportHook.setOtherTransportMode("");
      }
      setLoading(false);
    };
    initializeForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialInvoiceData]); // Rerun only when mode or initial data changes fundamentally

  // --- Effect to Update Form Data with Calculations ---
  useEffect(() => {
    // Update the main formData state only when calculated values actually change
    formDataHook.setFormData((prev) => {
      // Check if any calculated value differs from the previous state
      if (
        prev.total_amount_before_tax !==
          calculationsHook.total_amount_before_tax ||
        prev.cgst_amount !== calculationsHook.cgst_amount ||
        prev.sgst_amount !== calculationsHook.sgst_amount ||
        prev.igst_amount !== calculationsHook.igst_amount ||
        prev.total_amount_after_tax !== calculationsHook.total_amount_after_tax
      ) {
        // If changed, return new state object with updated calculations
        return {
          ...prev,
          ...calculationsHook, // Spread the new calculated totals
        };
      }
      // If no change in calculated values, return the previous state to prevent re-render loop
      return prev;
    });
  }, [
    // Depend on the primitive calculated values instead of the object reference
    calculationsHook.total_amount_before_tax,
    calculationsHook.cgst_amount,
    calculationsHook.sgst_amount,
    calculationsHook.igst_amount,
    calculationsHook.total_amount_after_tax,
    formDataHook.setFormData, // Include the stable setter function in dependencies
  ]);

  // --- Compose Return Value ---
  // Combine state and handlers from all hooks into a single object matching the original interface
  return {
    // Form Data related state and handlers
    formData: formDataHook.formData,
    handleChange: formDataHook.handleChange,
    handleSelectChange: formDataHook.handleSelectChange,
    handlePackingChargesChange: formDataHook.handlePackingChargesChange,
    handleTaxTypeChange: formDataHook.handleTaxTypeChange,
    handleTaxRateChange: formDataHook.handleTaxRateChange,

    // Items related state and handlers
    items: itemsHook.items,
    itemProductDataMap: itemsHook.itemProductDataMap,
    handleItemChange: itemsHook.handleItemChange, // This now supports 'name' field
    addItemRow: itemsHook.addItemRow,
    removeItemRow: itemsHook.removeItemRow,
    handleProductSelect: itemsHook.handleProductSelect,
    handleProductAddSuccess: itemsHook.handleProductAddSuccess,

    // Client Selection related state and handlers
    displayedBillingDetails: clientSelectionHook.displayedBillingDetails,
    displayedShippingDetails: clientSelectionHook.displayedShippingDetails,
    sameAsBilledTo: clientSelectionHook.sameAsBilledTo,
    selectedBilledClientId: clientSelectionHook.selectedBilledClientId, // Expose if needed by UI
    selectedShippedClientId: clientSelectionHook.selectedShippedClientId, // Expose if needed by UI
    handleDisplayedBillingChange:
      clientSelectionHook.handleDisplayedBillingChange,
    handleDisplayedShippingChange:
      clientSelectionHook.handleDisplayedShippingChange,
    handleBillingClientSelect: clientSelectionHook.handleBillingClientSelect,
    handleShippingClientSelect: clientSelectionHook.handleShippingClientSelect,
    handleSameAsBilledTo: clientSelectionHook.handleSameAsBilledTo,
    handleClientAddSuccess: clientSelectionHook.handleClientAddSuccess,

    // Transport Mode related state and handlers
    transportModes: transportHook.transportModes,
    selectedTransportMode: transportHook.selectedTransportMode,
    otherTransportMode: transportHook.otherTransportMode,
    handleTransportModeChange: transportHook.handleTransportModeChange,
    handleOtherTransportModeChange:
      transportHook.handleOtherTransportModeChange,
    // transportModeValue is used internally by handleSubmit

    // Submission related state and handler
    submitting: submissionHook.submitting,
    error: submissionHook.error,
    // Wrap handleSubmit to pass all required arguments from the composed state
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault(); // Prevent default form submission
      submissionHook.handleSubmit(
        formDataHook.formData,
        itemsHook.items,
        clientSelectionHook.selectedBilledClientId,
        clientSelectionHook.selectedShippedClientId,
        clientSelectionHook.displayedBillingDetails,
        clientSelectionHook.displayedShippingDetails,
        clientSelectionHook.sameAsBilledTo,
        transportHook.transportModeValue,
        calculationsHook // Pass the calculated totals object
      );
    },

    // Data Fetchers
    fetchClientSuggestions,
    fetchProductSuggestions,

    // Utilities
    amountToWords, // Expose utility

    // General State
    loading,
  };
};
