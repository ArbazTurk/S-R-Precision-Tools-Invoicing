"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client"; // Corrected import path
import { useToast } from "./use-toast"; // Corrected import path
import { Invoice, Client, Product } from "../types/database"; // Added Product type
// Import the local FormInvoiceItem definition
import { FormInvoiceItem } from "./useInvoiceItems"; // Assuming FormInvoiceItem is defined/exported here now
import { validateGSTIN, amountToWords } from "../lib/invoiceClientUtils"; // Corrected import path

interface UseInvoiceSubmissionProps {
  mode: "create" | "edit";
  invoiceId?: string; // ID needed for edit mode
}

/**
 * Handles invoice form validation and submission logic, including client creation/lookup.
 * @param mode - "create" or "edit".
 * @param invoiceId - The ID of the invoice being edited.
 * @returns Submission state and the handleSubmit function.
 */
export const useInvoiceSubmission = ({
  mode,
  invoiceId,
}: UseInvoiceSubmissionProps) => {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to find an existing client by GSTIN or create a new one if not found
  const findOrCreateClient = async (
    details: Partial<Client>
  ): Promise<string | null> => {
    // Basic validation for manually entered/displayed details
    if (!details.name?.trim()) {
      toast({
        variant: "destructive",
        title: "Client Error",
        description: "Client name cannot be empty.",
      });
      return null;
    }
    if (!details.gstin?.trim()) {
      toast({
        variant: "destructive",
        title: "Client Error",
        description: "Client GSTIN cannot be empty.",
      });
      return null;
    }
    const gstinValidation = validateGSTIN(details.gstin);
    if (!gstinValidation.valid) {
      toast({
        variant: "destructive",
        title: "Client Error",
        description: gstinValidation.message || "Invalid GSTIN.",
      });
      return null;
    }

    const clientDataForDb: Omit<Client, "id" | "created_at"> = {
      name: details.name!.trim(), // Use ! as validations ensure presence
      address: details.address || undefined,
      gstin: details.gstin!.trim(), // Use ! as validations ensure presence
      phone: details.phone || undefined,
      state: details.state || undefined,
      state_code: details.state_code || undefined,
    };

    if (mode === "edit") {
      // In edit mode, always create a new client record for the provided details
      try {
        const { data: newClient, error: insertError } = await supabase
          .from("clients")
          .insert(clientDataForDb)
          .select("id")
          .single();

        if (insertError) {
          console.error(
            "Error inserting new client in edit mode:",
            insertError
          );
          throw insertError;
        }
        toast({
          title: "Client Details Updated (New Record)",
          description: `A new record for client '${clientDataForDb.name}' has been saved.`,
        });
        return newClient!.id; // newClient should not be null if no error
      } catch (err: any) {
        setError(`Failed to save new client record: ${err.message}`);
        toast({
          variant: "destructive",
          title: "Client Save Error",
          description: `Could not save new client record: ${err.message}`,
        });
        return null;
      }
    } else {
      // mode === "create"
      // In create mode, try to find an existing client by GSTIN, otherwise create a new one
      try {
        const { data: existingClient, error: findError } = await supabase
          .from("clients")
          .select("id")
          .eq("gstin", clientDataForDb.gstin)
          .maybeSingle();

        if (findError) {
          console.error("Error finding client in create mode:", findError);
          throw findError;
        }

        if (existingClient) {
          return existingClient.id; // Found existing client
        } else {
          // Client not found, create a new one
          const { data: newClient, error: insertError } = await supabase
            .from("clients")
            .insert(clientDataForDb)
            .select("id")
            .single();

          if (insertError) {
            console.error(
              "Error inserting new client in create mode:",
              insertError
            );
            throw insertError;
          }
          toast({
            title: "Client Created",
            description: `New client '${clientDataForDb.name}' saved.`,
          });
          return newClient!.id; // newClient should not be null if no error
        }
      } catch (err: any) {
        setError(`Failed to save client details: ${err.message}`);
        toast({
          variant: "destructive",
          title: "Client Save Error",
          description: `Could not save client: ${err.message}`,
        });
        return null;
      }
    }
  };

  // Helper to find an existing product by name or create a new one
  const findOrCreateProduct = async (
    itemDetails: FormInvoiceItem
  ): Promise<string | null> => {
    // If product_id is already set, return it directly
    if (itemDetails.product_id) {
      return itemDetails.product_id;
    }

    const name = itemDetails.name?.trim();
    const hsn = itemDetails.hsn_sac_code?.trim();

    if (!name) {
      toast({
        variant: "destructive",
        title: "Product Error",
        description: "Product name cannot be empty.",
      });
      return null;
    }
    // HSN validation could be added here if needed

    try {
      // Attempt to find product by name (case-insensitive comparison might be better)
      const { data: existingProduct, error: findError } = await supabase
        .from("products")
        .select("id")
        .ilike("name", name) // Case-insensitive search
        .maybeSingle();

      if (findError) throw findError;

      if (existingProduct) {
        return existingProduct.id; // Found existing product
      } else {
        // Product not found, create a new one
        const productToInsert: Omit<Product, "id" | "created_at"> = {
          name: name,
          hsn_sac_code: hsn || undefined, // Use undefined instead of null if DB expects string | undefined
          // Add default values for other required product fields if any
          // Removed 'unit' field as it doesn't exist on the Product type
        };
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert(productToInsert)
          .select("id")
          .single();

        if (insertError) throw insertError;
        toast({
          title: "Product Created",
          description: `New product '${productToInsert.name}' saved.`,
        });
        return newProduct.id;
      }
    } catch (err: any) {
      setError(`Failed to save product details: ${err.message}`);
      toast({
        variant: "destructive",
        title: "Product Save Error",
        description: `Could not save product: ${err.message}`,
      });
      return null;
    }
  };

  // Form validation logic
  const validateForm = useCallback(
    (
      formData: Partial<Invoice>,
      items: FormInvoiceItem[],
      // Use final client IDs obtained after potential findOrCreateClient calls
      finalBilledToId: string | null,
      finalShippedToId: string | null,
      // Still need displayed details for GSTIN validation if client was manually entered
      displayedBillingDetails: Partial<Client>,
      displayedShippingDetails: Partial<Client>,
      sameAsBilledTo: boolean
    ) => {
      const errors: string[] = [];
      if (!formData.invoice_number) errors.push("Invoice number is required.");
      if (!formData.invoice_date) errors.push("Invoice date is required.");

      // Validate client presence using the final IDs
      if (!finalBilledToId) errors.push("Billing client is required.");
      if (!finalShippedToId) errors.push("Shipping client is required.");

      // Validate GSTIN format for the details that were potentially used to create the client
      const billingGstinCheck = validateGSTIN(displayedBillingDetails.gstin);
      if (displayedBillingDetails.gstin && !billingGstinCheck.valid) {
        errors.push(
          `Billing client: ${billingGstinCheck.message || "Invalid GSTIN."}`
        );
      }
      // Only validate shipping GSTIN if not same as billing and details were provided
      if (!sameAsBilledTo && displayedShippingDetails.gstin) {
        const shippingGstinCheck = validateGSTIN(
          displayedShippingDetails.gstin
        );
        if (!shippingGstinCheck.valid) {
          errors.push(
            `Shipping client: ${shippingGstinCheck.message || "Invalid GSTIN."}`
          );
        }
      }

      if (items.length === 0) errors.push("At least one item is required.");
      items.forEach((item, index) => {
        // Check if either product_id or name is present
        if (!item.product_id && !item.name)
          errors.push(`Item ${index + 1}: Product is required.`);
        if (item.quantity <= 0)
          errors.push(`Item ${index + 1}: Quantity must be positive.`);
        if (item.rate < 0)
          errors.push(`Item ${index + 1}: Rate cannot be negative.`);
      });
      if (!formData.tax_type)
        errors.push("Tax type (CGST/SGST or IGST) must be selected.");

      if (errors.length > 0) {
        setError(errors.join(" \n"));
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: errors.join(" \n"),
        });
        return false;
      }
      setError(null);
      return true;
    },
    [toast] // Dependency
  );

  // Main submission handler
  const handleSubmit = useCallback(
    async (
      // Pass all necessary state pieces from the composed hook
      formData: Partial<Invoice>,
      items: FormInvoiceItem[],
      selectedBilledClientId: string | null, // Initial selected ID
      selectedShippedClientId: string | null, // Initial selected ID
      displayedBillingDetails: Partial<Client>,
      displayedShippingDetails: Partial<Client>,
      sameAsBilledTo: boolean,
      transportModeValue: string,
      calculatedTotals: {
        // Pass calculated totals
        total_amount_before_tax: number;
        cgst_amount: number;
        sgst_amount: number;
        igst_amount: number;
        total_amount_after_tax: number;
      }
    ) => {
      setSubmitting(true);
      setError(null);

      try {
        // --- Determine Final Client IDs ---
        let finalBilledToId: string | null = null;
        let finalShippedToId: string | null = null;

        // Handle Billed To Client
        const hasDisplayedBillingDetails =
          displayedBillingDetails.name?.trim() &&
          displayedBillingDetails.gstin?.trim();

        if (mode === "edit") {
          if (hasDisplayedBillingDetails) {
            finalBilledToId = await findOrCreateClient(displayedBillingDetails);
          } else {
            finalBilledToId = selectedBilledClientId; // Use original if no new details provided or details cleared
          }
        } else {
          // mode === "create"
          if (hasDisplayedBillingDetails) {
            finalBilledToId = await findOrCreateClient(displayedBillingDetails);
          } else {
            finalBilledToId = selectedBilledClientId; // Typically null for 'create' unless pre-filled
          }
        }

        // If findOrCreateClient was called for billing (because details were present) but failed (e.g., validation inside it)
        if (hasDisplayedBillingDetails && !finalBilledToId) {
          // findOrCreateClient already shows a toast for its internal validation errors.
          setSubmitting(false);
          return; // Stop submission
        }

        // Handle Shipped To Client
        if (sameAsBilledTo) {
          finalShippedToId = finalBilledToId;
        } else {
          const hasDisplayedShippingDetails =
            displayedShippingDetails.name?.trim() &&
            displayedShippingDetails.gstin?.trim();
          if (mode === "edit") {
            if (hasDisplayedShippingDetails) {
              finalShippedToId = await findOrCreateClient(
                displayedShippingDetails
              );
            } else {
              finalShippedToId = selectedShippedClientId; // Use original if no new details or details cleared
            }
          } else {
            // mode === "create"
            if (hasDisplayedShippingDetails) {
              finalShippedToId = await findOrCreateClient(
                displayedShippingDetails
              );
            } else {
              finalShippedToId = selectedShippedClientId;
            }
          }

          // If findOrCreateClient was called for shipping (because details were present) but failed
          if (hasDisplayedShippingDetails && !finalShippedToId) {
            setSubmitting(false);
            return; // Stop submission
          }
        }
        // --- End Client ID Determination ---

        // --- Validate Form with Final IDs ---
        if (
          !validateForm(
            formData,
            items,
            finalBilledToId,
            finalShippedToId,
            displayedBillingDetails, // Pass details for GSTIN validation context
            displayedShippingDetails,
            sameAsBilledTo
          )
        ) {
          setSubmitting(false);
          return;
        }
        // --- End Validation ---

        // --- Process Items: Find or Create Products ---
        const processedItems = await Promise.all(
          items.map(async (item) => {
            if (item.product_id) {
              return item; // Already has an ID, likely selected via autocomplete
            }
            // If no product_id, try to find or create based on name/hsn
            const productId = await findOrCreateProduct(item);
            if (!productId) {
              // Throw an error or handle failure to prevent proceeding with invalid item
              throw new Error(
                `Failed to find or create product for item: ${item.name || "Unnamed Item"}`
              );
            }
            return { ...item, product_id: productId }; // Return item with the obtained product_id
          })
        );
        // --- End Item Processing ---

        // --- Prepare Invoice Data for Save ---
        const invoiceDataToSave: Omit<
          Invoice,
          "id" | "created_at" | "billed_client" | "shipped_client"
        > = {
          invoice_number: formData.invoice_number!,
          invoice_date: formData.invoice_date!,
          transport_mode: transportModeValue,
          vehicle_number: formData.vehicle_number || undefined,
          supply_date_time: formData.supply_date_time || undefined,
          place_of_supply: formData.place_of_supply || undefined,
          po_rgp_no: formData.po_rgp_no || undefined,
          order_date: formData.order_date || undefined,
          billed_to_client_id: finalBilledToId, // Use final ID
          shipped_to_client_id: finalShippedToId, // Use final ID
          // Use calculated totals passed into the handler
          total_amount_before_tax: calculatedTotals.total_amount_before_tax,
          tax_type: formData.tax_type!,
          cgst_rate:
            formData.tax_type === "CGST_SGST" ? (formData.cgst_rate ?? 0) : 0,
          cgst_amount: calculatedTotals.cgst_amount,
          sgst_rate:
            formData.tax_type === "CGST_SGST" ? (formData.sgst_rate ?? 0) : 0,
          sgst_amount: calculatedTotals.sgst_amount,
          igst_rate:
            formData.tax_type === "IGST" ? (formData.igst_rate ?? 0) : 0,
          igst_amount: calculatedTotals.igst_amount,
          packing_cartage_charges: formData.packing_cartage_charges ?? 0,
          total_amount_after_tax: calculatedTotals.total_amount_after_tax,
          total_amount_in_words: await amountToWords(
            calculatedTotals.total_amount_after_tax ?? 0
          ),
        };
        // --- End Invoice Data Preparation ---

        // --- Save Invoice and Items ---
        let savedInvoiceId: string;
        if (mode === "edit" && invoiceId) {
          // Update existing invoice
          const { data, error } = await supabase
            .from("invoices")
            .update(invoiceDataToSave)
            .eq("id", invoiceId)
            .select("id")
            .single();
          if (error) throw error;
          savedInvoiceId = data.id;
          // Delete old items before inserting new ones
          const { error: deleteError } = await supabase
            .from("invoice_items")
            .delete()
            .eq("invoice_id", savedInvoiceId);
          if (deleteError) throw deleteError;
        } else {
          // Insert new invoice
          const { data, error } = await supabase
            .from("invoices")
            .insert(invoiceDataToSave)
            .select("id")
            .single();
          if (error) throw error;
          savedInvoiceId = data.id;
        }

        // Insert invoice items using processed items with guaranteed product_id
        const itemsToInsert = processedItems.map((item) => ({
          invoice_id: savedInvoiceId,
          product_id: item.product_id!, // Use the guaranteed ID
          // hsn_sac_code field removed as it doesn't exist in the invoice_items table
          quantity: item.quantity,
          rate: item.rate,
          taxable_value: item.taxable_value,
        }));
        const { error: itemsError } = await supabase
          .from("invoice_items")
          .insert(itemsToInsert);
        if (itemsError) throw itemsError;
        // --- End Save ---

        toast({
          title: "Success",
          description: `Invoice ${invoiceDataToSave.invoice_number} ${mode === "edit" ? "updated" : "created"} successfully.`,
        });
        router.push("/dashboard");
        router.refresh();
      } catch (err: any) {
        setError(
          `Failed to ${mode === "edit" ? "update" : "create"} invoice: ${err.message}`
        );
        toast({
          variant: "destructive",
          title: "Save Error",
          description: err.message,
        });
      } finally {
        setSubmitting(false);
      }
    },
    // Dependencies for handleSubmit
    [
      mode,
      invoiceId,
      supabase,
      toast,
      router,
      validateForm,
      findOrCreateClient,
      findOrCreateProduct,
    ] // Added findOrCreateProduct
  );

  return { submitting, error, handleSubmit };
};
