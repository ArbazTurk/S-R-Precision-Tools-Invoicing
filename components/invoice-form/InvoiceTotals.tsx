"use client";

import { useState, useEffect } from "react"; // Import hooks
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Invoice } from "@/types/database";

interface InvoiceTotalsProps {
  formData: Partial<Invoice>;
  handlePackingChargesChange: (value: string) => void;
  handleTaxTypeChange: (taxType: "CGST_SGST" | "IGST") => void;
  handleTaxRateChange: (
    field: "cgst_rate" | "sgst_rate" | "igst_rate",
    value: string
  ) => void;
  amountToWords: (amount: number) => Promise<string>; // Update prop type to Promise<string>
}

export default function InvoiceTotals({
  formData,
  handlePackingChargesChange,
  handleTaxTypeChange,
  handleTaxRateChange,
  amountToWords,
}: InvoiceTotalsProps) {
  const [amountInWordsText, setAmountInWordsText] = useState("Calculating...");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const totalAmount = formData.total_amount_after_tax || 0;

    amountToWords(totalAmount)
      .then((words) => {
        if (isMounted) {
          setAmountInWordsText(words);
        }
      })
      .catch((error) => {
        console.error("Error getting amount in words:", error);
        if (isMounted) {
          setAmountInWordsText(`Rupees ${totalAmount.toFixed(2)} (Error)`);
        }
      });

    return () => {
      isMounted = false;
    }; // Cleanup function
  }, [formData.total_amount_after_tax, amountToWords]); // Dependencies

  const formatCurrency = (amount: number | undefined | null) => {
    return `₹${(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="border p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Calculation Inputs */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="packing_cartage_charges">
            Packing/Cartage Charges
          </Label>
          <Input
            id="packing_cartage_charges"
            type="number"
            min="0"
            step="any"
            value={
              focusedField === "packing_cartage_charges"
                ? formData.packing_cartage_charges === 0
                  ? ""
                  : formData.packing_cartage_charges
                : formData.packing_cartage_charges || 0
            }
            onChange={(e) => handlePackingChargesChange(e.target.value)}
            onFocus={() => setFocusedField("packing_cartage_charges")}
            onBlur={() => setFocusedField(null)}
            className="text-right"
          />
        </div>
        
        <div>
          <Label htmlFor="total_amount_before_tax">
            Total Amount Before Tax
          </Label>
          <Input
            id="total_amount_before_tax"
            readOnly
            value={formatCurrency(formData.total_amount_before_tax)}
            className="bg-gray-100 text-right cursor-not-allowed"
          />
        </div>

        <div>
          <Label>Tax Type</Label>
          <RadioGroup
            value={formData.tax_type || "IGST"} // Default to IGST if not set
            onValueChange={(value: string) =>
              handleTaxTypeChange(value as "CGST_SGST" | "IGST")
            }
            className="flex space-x-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="CGST_SGST" id="cgst_sgst" />
              <Label htmlFor="cgst_sgst">CGST + SGST</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="IGST" id="igst" />
              <Label htmlFor="igst">IGST</Label>
            </div>
          </RadioGroup>
        </div>

        {formData.tax_type === "CGST_SGST" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cgst_rate">CGST Rate (%)</Label>
              <Input
                id="cgst_rate"
                type="number"
                min="0"
                step="any"
                value={
                  focusedField === "cgst_rate"
                    ? formData.cgst_rate === 0
                      ? ""
                      : formData.cgst_rate
                    : formData.cgst_rate || 0
                }
                onChange={(e) =>
                  handleTaxRateChange("cgst_rate", e.target.value)
                }
                onFocus={() => setFocusedField("cgst_rate")}
                onBlur={() => setFocusedField(null)}
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="sgst_rate">SGST Rate (%)</Label>
              <Input
                id="sgst_rate"
                type="number"
                min="0"
                step="any"
                value={
                  focusedField === "sgst_rate"
                    ? formData.sgst_rate === 0
                      ? ""
                      : formData.sgst_rate
                    : formData.sgst_rate || 0
                }
                onChange={(e) =>
                  handleTaxRateChange("sgst_rate", e.target.value)
                }
                onFocus={() => setFocusedField("sgst_rate")}
                onBlur={() => setFocusedField(null)}
                className="text-right"
              />
            </div>
          </div>
        )}

        {formData.tax_type === "IGST" && (
          <div>
            <Label htmlFor="igst_rate">IGST Rate (%)</Label>
            <Input
              id="igst_rate"
              type="number"
              min="0"
              step="any"
              value={
                focusedField === "igst_rate"
                  ? formData.igst_rate === 0
                    ? ""
                    : formData.igst_rate
                  : formData.igst_rate || 0
              }
              onChange={(e) => handleTaxRateChange("igst_rate", e.target.value)}
              onFocus={() => setFocusedField("igst_rate")}
              onBlur={() => setFocusedField(null)}
              className="text-right"
            />
          </div>
        )}
      </div>

      {/* Right: Calculated Totals */}
      <div className="space-y-4 bg-gray-50 p-4 rounded-md border">
        <div className="flex justify-between items-center">
          <Label>Subtotal:</Label>
          <span className="font-medium">
            {formatCurrency((formData.total_amount_before_tax || 0) - (formData.packing_cartage_charges || 0))}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <Label>Packing/Cartage:</Label>
          <span className="font-medium">
            {formatCurrency(formData.packing_cartage_charges)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <Label>Taxable Amount:</Label>
          <span className="font-medium">
            {formatCurrency(formData.total_amount_before_tax)}
          </span>
        </div>

        {formData.tax_type === "CGST_SGST" && (
          <>
            <div className="flex justify-between items-center">
              <Label>CGST ({formData.cgst_rate || 0}%):</Label>
              <span className="font-medium">
                {formatCurrency(formData.cgst_amount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <Label>SGST ({formData.sgst_rate || 0}%):</Label>
              <span className="font-medium">
                {formatCurrency(formData.sgst_amount)}
              </span>
            </div>
          </>
        )}
        {formData.tax_type === "IGST" && (
          <div className="flex justify-between items-center">
            <Label>IGST ({formData.igst_rate || 0}%):</Label>
            <span className="font-medium">
              {formatCurrency(formData.igst_amount)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <Label>Grand Total:</Label>
          <span>{formatCurrency(formData.total_amount_after_tax)}</span>
        </div>
        <div className="pt-2">
          <Label>Amount in Words:</Label>
          <p className="text-sm text-muted-foreground bg-white p-2 rounded border min-h-[40px]">
            {" "}
            {/* Added min-height */}
            {amountInWordsText}
          </p>
        </div>
      </div>
    </div>
  );
}
