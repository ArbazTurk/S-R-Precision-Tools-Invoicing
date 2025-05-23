"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import AutocompleteInput from "@/components/AutocompleteInput";
import { Product } from "@/types/database";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ProductAddForm from "@/components/ProductAddForm";
import { useState } from "react";
import type { AutocompleteOption } from "@/components/AutocompleteInput"; // Import AutocompleteOption
import type { FormInvoiceItem } from "@/hooks/useInvoiceItems"; // Import the correct interface

// Remove the local definition of FormInvoiceItem as it's now imported

interface InvoiceItemsListProps {
  items: FormInvoiceItem[];
  itemProductDataMap: Record<string, Product | null>; // Map from item index to Product data
  handleItemChange: (
    index: number,
    field: "quantity" | "rate" | "hsn_sac_code" | "name",
    value: string | number
  ) => void;
  addItemRow: () => void;
  removeItemRow: (index: number) => void;
  fetchProductSuggestions: (query: string) => Promise<AutocompleteOption[]>; // Use AutocompleteOption
  handleProductSelect: (index: number) => (option: AutocompleteOption) => void; // Use AutocompleteOption
  handleProductAddSuccess: (product: Product) => void;
}

export default function InvoiceItemsList({
  items,
  itemProductDataMap, // Receive the product data map
  handleItemChange,
  addItemRow,
  removeItemRow,
  fetchProductSuggestions,
  handleProductSelect,
  handleProductAddSuccess,
}: InvoiceItemsListProps) {
  const [productDialogOpen, setProductDialogOpen] = useState(false);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="border p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Items</h3>
        {/* Removed Add New Product Dialog */}
      </div>

      {/* Item Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-2">
        <div className="col-span-4">Product/Service</div>
        <div className="col-span-2">HSN/SAC</div>
        <div className="col-span-1">Qty</div>
        <div className="col-span-2">Rate (₹)</div>
        <div className="col-span-2">Amount (₹)</div>
        <div className="col-span-1"></div> {/* Delete button column */}
      </div>

      {/* Item Rows */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="grid grid-cols-12 gap-2 items-start border-b pb-3 md:border-none md:pb-0"
          >
            {/* Product/Service */}
            <div className="col-span-12 md:col-span-4">
              <Label
                htmlFor={`product_select_${index}`}
                className="md:hidden mb-1 block text-xs"
              >
                Product/Service
              </Label>
              <AutocompleteInput
                id={`product_select_${index}`}
                placeholder="Search product..."
                // Display product name from map if available
                value={itemProductDataMap[index]?.name ?? item.name ?? ""}
                // onChange is handled internally by AutocompleteInput for search
                onChange={(value) => {
                  // If user clears the input, clear the product_id as well
                  if (!value.trim()) {
                    handleItemChange(index, "name", "");
                  } else {
                    // Update the name field directly
                    handleItemChange(index, "name", value);
                  }
                }}
                onSelect={handleProductSelect(index)}
                fetchSuggestions={fetchProductSuggestions}
              />
            </div>

            {/* HSN/SAC */}
            <div className="col-span-6 md:col-span-2">
              <Label
                htmlFor={`hsn_sac_code_${index}`}
                className="md:hidden mb-1 block text-xs"
              >
                HSN/SAC
              </Label>
              <Input
                id={`hsn_sac_code_${index}`}
                placeholder="HSN/SAC"
                // Bind value to the item state, which is updated by onChange
                value={item.hsn_sac_code || ""}
                // onChange correctly updates the item state via handleItemChange
                onChange={(e) =>
                  handleItemChange(index, "hsn_sac_code", e.target.value)
                }
              />
            </div>

            {/* Quantity */}
            <div className="col-span-6 md:col-span-1">
              <Label
                htmlFor={`quantity_${index}`}
                className="md:hidden mb-1 block text-xs"
              >
                Qty
              </Label>
              <Input
                id={`quantity_${index}`}
                type="number"
                min="0"
                step="any"
                placeholder="Qty"
                value={
                  focusedField === `quantity_${index}`
                    ? item.quantity === 1
                      ? ""
                      : item.quantity
                    : item.quantity
                }
                onChange={(e) =>
                  // Pass the raw string value to the hook
                  handleItemChange(index, "quantity", e.target.value)
                }
                onFocus={() => setFocusedField(`quantity_${index}`)}
                onBlur={() => setFocusedField(null)}
                className="text-right"
              />
            </div>

            {/* Rate */}
            <div className="col-span-6 md:col-span-2">
              <Label
                htmlFor={`rate_${index}`}
                className="md:hidden mb-1 block text-xs"
              >
                Rate (₹)
              </Label>
              <Input
                id={`rate_${index}`}
                type="number"
                min="0"
                step="any"
                placeholder="Rate"
                value={
                  focusedField === `rate_${index}`
                    ? item.rate === 0
                      ? ""
                      : item.rate
                    : item.rate
                }
                onChange={(e) =>
                  // Pass the raw string value to the hook
                  handleItemChange(index, "rate", e.target.value)
                }
                onFocus={() => setFocusedField(`rate_${index}`)}
                onBlur={() => setFocusedField(null)}
                className="text-right"
              />
            </div>

            {/* Amount (Taxable Value) */}
            <div className="col-span-6 md:col-span-2">
              <Label
                htmlFor={`taxable_value_${index}`}
                className="md:hidden mb-1 block text-xs"
              >
                Amount (₹)
              </Label>
              <Input
                id={`taxable_value_${index}`}
                type="number"
                readOnly
                value={item.taxable_value.toFixed(2)}
                className="bg-gray-100 text-right cursor-not-allowed"
                aria-label="Taxable Amount (auto-calculated)"
              />
            </div>

            {/* Delete Button */}
            <div className="col-span-12 md:col-span-1 flex items-center justify-end md:pt-6">
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeItemRow(index)}
                  aria-label="Remove item"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Button */}
      <Button
        type="button"
        variant="outline"
        onClick={addItemRow}
        className="mt-4"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
      </Button>
    </div>
  );
}
