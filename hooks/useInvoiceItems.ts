"use client";

import { useState, useCallback } from "react";
import { Product } from "../types/database"; // Keep Product import
import { useToast } from "./use-toast"; // Corrected import path

// Define the structure for items in the form state locally and export it
export interface FormInvoiceItem { // Added export
  id?: string; // Optional ID for existing items being edited
  product_id: string | null; // Foreign key to products table
  name: string | null; // Add product name
  hsn_sac_code: string | null; // Add HSN/SAC code
  quantity: number;
  rate: number;
  taxable_value: number;
}

interface UseInvoiceItemsProps {
  initialItems?: FormInvoiceItem[];
  initialItemProductDataMap?: Record<string, Product | null>; // Allow passing initial map
}

// Helper function to create an empty item row
const createEmptyItemRow = (): FormInvoiceItem => ({
  product_id: null,
  name: null, // Initialize name
  hsn_sac_code: null,
  quantity: 1,
  rate: 0,
  taxable_value: 0,
});

/**
 * Manages invoice items state and associated product data.
 * @param initialItems - Initial items for edit mode.
 * @param initialItemProductDataMap - Initial mapping of item index to product data.
 * @returns Items state, product data map, and handlers.
 */
export const useInvoiceItems = ({ initialItems, initialItemProductDataMap }: UseInvoiceItemsProps = {}) => {
  const { toast } = useToast();
  const [items, setItems] = useState<FormInvoiceItem[]>(initialItems || [createEmptyItemRow()]);
  const [itemProductDataMap, setItemProductDataMap] = useState<Record<string, Product | null>>(initialItemProductDataMap || {}); // Keep map for selected product data if needed elsewhere

  const handleItemChange = useCallback(
    // Update field type to include 'name'
    (index: number, field: keyof Omit<FormInvoiceItem, "id" | "product_id">, value: string | number | null) => {
      setItems((currentItems) => {
        const updatedItems = [...currentItems];
        const currentItem = { ...updatedItems[index] };

        // Handle name and hsn_sac_code as strings or null
        if (field === "name" || field === "hsn_sac_code") {
          currentItem[field] = typeof value === "string" ? value.trim() : null;
           // If name is changed manually, clear the product_id and product data map entry
           // as it no longer corresponds to a selected product.
           if (field === 'name') {
               currentItem.product_id = null;
               setItemProductDataMap(prevMap => {
                   const newMap = {...prevMap};
                   delete newMap[index];
                   return newMap;
               });
           }
        } else if (field === "quantity" || field === "rate") {
           // Handle numeric fields
           const numericValue = typeof value === "string" ? parseFloat(value) : (typeof value === 'number' ? value : 0);
           currentItem[field] = isNaN(numericValue) ? 0 : numericValue;
            // Recalculate taxable_value when quantity or rate changes
            currentItem.taxable_value = Number(
              ((currentItem.quantity || 0) * (currentItem.rate || 0)).toFixed(2)
            );
        }
        updatedItems[index] = currentItem;
        return updatedItems;
      });
    },
    [] // No dependencies needed for setItems setter
  );

  const addItemRow = useCallback(() => {
    setItems((prev) => [...prev, createEmptyItemRow()]);
  }, []);

  const removeItemRow = useCallback(
    (index: number) => {
      setItems((prev) => {
        if (prev.length <= 1) {
          toast({ variant: "destructive", title: "Cannot Remove", description: "Must have at least one item." });
          return prev;
        }
        // Also remove associated product data and adjust map keys
        setItemProductDataMap((currentMap) => {
          const newMap = { ...currentMap };
          delete newMap[index];
          const adjustedMap: Record<string, Product | null> = {};
          Object.keys(newMap).forEach((keyStr) => {
            const keyIndex = parseInt(keyStr, 10);
            if (keyIndex > index) adjustedMap[keyIndex - 1] = newMap[keyIndex];
            else if (keyIndex < index) adjustedMap[keyIndex] = newMap[keyIndex];
          });
          return adjustedMap;
        });
        return prev.filter((_, i) => i !== index);
      });
    },
    [toast]
  );

  const handleProductSelect = useCallback(
    (index: number) => (option: { value: string; label: string; data?: Product }) => {
      const product = option.data ?? null;
      setItems((currentItems) => {
        const updatedItems = [...currentItems];
        const currentItem = { ...updatedItems[index] };
        currentItem.product_id = product?.id ?? null; // Set product_id
        currentItem.name = product?.name ?? null; // Set name from selected product
        currentItem.hsn_sac_code = product?.hsn_sac_code || null; // Set HSN from selected product
        // Recalculate taxable value based on current quantity and rate
        currentItem.taxable_value = Number(
          (currentItem.quantity * currentItem.rate).toFixed(2)
        );
        updatedItems[index] = currentItem;
        return updatedItems;
      });
      // Update the map as well, might still be useful for display consistency
      setItemProductDataMap((prev) => ({ ...prev, [index]: product }));
    },
    [] // No dependencies needed
  );

  // This function might become redundant if we remove the Add Product button/dialog
  // Or it can be repurposed to handle adding a product directly from typed data if needed
  const handleProductAddSuccess = useCallback(
    (newProduct: Product) => {
      // Find the first empty item row or add a new one if none exist
      let targetIndex = items.findIndex((item) => !item.product_id);
      if (targetIndex === -1) {
        addItemRow(); // Add a new row first
        // Need to wait for state update or use the expected new length
        targetIndex = items.length; // This might be off by one if addItemRow is async, adjust if needed
      }

      // Update the target item row with the new product details
      setItems((currentItems) => {
        // Ensure targetIndex is valid after potential addItemRow
        const safeTargetIndex = targetIndex >= currentItems.length ? currentItems.length - 1 : targetIndex;
        if (safeTargetIndex < 0) return currentItems; // Should not happen if addItemRow works

        const updatedItems = [...currentItems];
        const currentItem = { ...updatedItems[safeTargetIndex] };
        currentItem.product_id = newProduct.id;
        currentItem.name = newProduct.name; // Set name
        currentItem.hsn_sac_code = newProduct.hsn_sac_code || null; // Set HSN
        // Recalculate taxable value
        currentItem.taxable_value = Number(
          (currentItem.quantity * currentItem.rate).toFixed(2)
        );
        updatedItems[safeTargetIndex] = currentItem;
        return updatedItems;
      });

      // Update the product data map for the target index
      setItemProductDataMap((prev) => {
         // Use the same safe index logic
         const safeTargetIndex = targetIndex >= items.length ? items.length - 1 : targetIndex;
         if (safeTargetIndex < 0) return prev;
         return { ...prev, [safeTargetIndex]: newProduct };
      });

      toast({ title: "Success", description: `Product '${newProduct.name}' added.` });
    },
    [items, addItemRow, toast] // Dependencies
  );

  return {
    items,
    setItems, // Expose setItems for initialization in the main hook
    itemProductDataMap,
    setItemProductDataMap, // Expose setter for initialization
    handleItemChange,
    addItemRow,
    removeItemRow,
    handleProductSelect,
    handleProductAddSuccess,
    createEmptyItemRow, // Expose helper if needed externally (e.g., for initial state)
  };
};
