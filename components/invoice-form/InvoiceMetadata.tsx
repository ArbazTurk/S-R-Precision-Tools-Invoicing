"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Invoice } from "@/types/database";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming shadcn Select

interface InvoiceMetadataProps {
  formData: Partial<Invoice>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // handleCheckboxChange: (name: string, checked: boolean) => void; // Removed unused prop
  handleSelectChange: (name: string, value: string) => void; // For Select component
  transportModes: string[];
  selectedTransportMode: string;
  handleTransportModeChange: (mode: string) => void;
  otherTransportMode: string;
  handleOtherTransportModeChange: (value: string) => void;
}

export default function InvoiceMetadata({
  formData,
  handleChange,
  // handleCheckboxChange, // Removed unused prop
  handleSelectChange, // Added
  transportModes,
  selectedTransportMode,
  handleTransportModeChange,
  otherTransportMode,
  handleOtherTransportModeChange,
}: InvoiceMetadataProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border p-4 rounded-lg">
      {/* Left Column */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="invoice_number">Invoice Number</Label>
          <Input
            id="invoice_number"
            name="invoice_number"
            value={formData.invoice_number || "Fetching..."} // Show fetching state
            readOnly
            className="bg-gray-100 cursor-not-allowed"
            aria-label="Invoice Number (read-only)"
          />
        </div>

        <div>
          <Label htmlFor="invoice_date">Invoice Date *</Label>
          <Input
            id="invoice_date"
            name="invoice_date"
            type="date"
            value={formData.invoice_date || ""}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

         <div>
          <Label htmlFor="supply_date_time">Date and Time of Supply</Label>
          <Input
            id="supply_date_time"
            name="supply_date_time"
            type="datetime-local" // Use datetime-local input type
            value={formData.supply_date_time ? formData.supply_date_time.substring(0, 16) : ""} // Format for input
            onChange={handleChange}
          />
        </div>

         <div>
          <Label htmlFor="po_rgp_no">P.O./RGP No.</Label>
          <Input
            id="po_rgp_no"
            name="po_rgp_no"
            value={formData.po_rgp_no || ""}
            onChange={handleChange}
          />
        </div>

      </div>

      {/* Right Column */}
      <div className="space-y-4">
         <div>
            <Label htmlFor="transport_mode">Transport Mode</Label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
               <Select
                  value={selectedTransportMode}
                  onValueChange={handleTransportModeChange}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select transport mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {transportModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              {selectedTransportMode === "Other" && (
                <Input
                  placeholder="Specify mode"
                  value={otherTransportMode}
                  onChange={(e) => handleOtherTransportModeChange(e.target.value)}
                  className="flex-1"
                />
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="vehicle_number">Vehicle Number</Label>
            <Input
              id="vehicle_number"
              name="vehicle_number"
              value={formData.vehicle_number || ""}
              onChange={handleChange}
            />
          </div>

          <div>
             {/* Assuming place_of_supply is just the state name for simplicity */}
            <Label htmlFor="place_of_supply">Place of Supply</Label>
            <Input
              id="place_of_supply"
              name="place_of_supply"
              value={formData.place_of_supply || ""}
              onChange={handleChange}
              placeholder="e.g., Delhi"
            />
          </div>
          
          <div>
          <Label htmlFor="order_date">Order Date</Label>
          <Input
            id="order_date"
            name="order_date"
            type="date"
            value={formData.order_date || ""}
            onChange={handleChange}
          />
        </div>

      </div>
    </div>
  );
}
