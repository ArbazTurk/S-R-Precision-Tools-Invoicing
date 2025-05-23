"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AutocompleteInput from "@/components/AutocompleteInput";
import { Client } from "@/types/database";
import { useState } from "react"; // Import useState
// import { Save } from "lucide-react"; // Save icon removed
import { Button } from "@/components/ui/button"; // Import Button
import type { AutocompleteOption } from "@/components/AutocompleteInput"; // Import AutocompleteOption type

interface ShippingDetailsProps {
  // shippingClient: Client | null; // No longer needed directly
  displayedShippingDetails: Partial<Client>; // Receive the details to display/edit
  selectedClientId: string | null; // Still needed to know if a client *is* selected
  sameAsBilledTo: boolean;
  handleSameAsBilledTo: (checked: boolean) => void;
  fetchClientSuggestions: (query: string) => Promise<AutocompleteOption[]>;
  handleClientSelect: (option: AutocompleteOption) => void;
  handleDisplayedShippingChange: (field: keyof Client, value: string) => void; // Add handler prop
  // TODO: Add handleSaveTypedClient prop later if needed
}

export default function ShippingDetails({
  displayedShippingDetails, // Use displayed details
  selectedClientId,
  sameAsBilledTo,
  handleSameAsBilledTo,
  fetchClientSuggestions,
  handleClientSelect,
  handleDisplayedShippingChange, // Destructure handler
}: ShippingDetailsProps) {
  // Disable fields if 'Same as Billed To' is checked
  const isDisabled = sameAsBilledTo;

  return (
    <div className="border p-4 rounded-lg space-y-3">
      <h3 className="font-bold">Shipped To</h3>
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="sameAsBilledTo"
          checked={sameAsBilledTo}
          onCheckedChange={(checked: boolean) => handleSameAsBilledTo(checked)}
        />
        <Label htmlFor="sameAsBilledTo" className="cursor-pointer">
          Same as Billed To
        </Label>
      </div>

      {/* Conditionally render the rest of the form */}
      <div
        className={`space-y-3 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        {" "}
        {/* Added pointer-events-none */}
        <div>
          <Label htmlFor="shipped_to_name">Name</Label>
          <AutocompleteInput
            id="shipped_to_name"
            placeholder="Search or type client name..." // Adjust placeholder
            value={displayedShippingDetails.name ?? ""} // Use displayed details
            onChange={(value) => handleDisplayedShippingChange("name", value)} // Use handler
            onSelect={handleClientSelect}
            fetchSuggestions={fetchClientSuggestions}
            disabled={isDisabled}
            aria-disabled={isDisabled}
          />
           {/* TODO: Add Save button later if needed */}
        </div>
        <div>
          <Label htmlFor="shipped_to_address">Address</Label>
          <Input
             id="shipped_to_address"
             value={displayedShippingDetails.address || ""} // Use displayed details
             onChange={(e) => handleDisplayedShippingChange("address", e.target.value)} // Use handler
             disabled={isDisabled}
             aria-disabled={isDisabled}
           />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="shipped_to_gstin">GSTIN</Label>
            <Input
               id="shipped_to_gstin"
               value={displayedShippingDetails.gstin || ""} // Use displayed details
               onChange={(e) => handleDisplayedShippingChange("gstin", e.target.value)} // Use handler
               maxLength={15}
               disabled={isDisabled}
               aria-disabled={isDisabled}
               // pattern="^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$" // Restore if needed
               // title="Enter valid 15-digit GSTIN (if applicable)"
             />
          </div>

          <div>
            <Label htmlFor="shipped_to_phone">Phone</Label>
            <Input
               id="shipped_to_phone"
               type="tel"
               value={displayedShippingDetails.phone || ""} // Use displayed details
               onChange={(e) => handleDisplayedShippingChange("phone", e.target.value)} // Use handler
               disabled={isDisabled}
               aria-disabled={isDisabled}
             />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="shipped_to_state">State</Label>
            <Input
               id="shipped_to_state"
               value={displayedShippingDetails.state || ""} // Use displayed details
               onChange={(e) => handleDisplayedShippingChange("state", e.target.value)} // Use handler
               disabled={isDisabled}
               aria-disabled={isDisabled}
               placeholder="e.g., Uttar Pradesh"
             />
          </div>
          <div>
            <Label htmlFor="shipped_to_state_code">State Code</Label>
            <Input
               id="shipped_to_state_code"
               value={displayedShippingDetails.state_code || ""} // Use displayed details
               onChange={(e) => handleDisplayedShippingChange("state_code", e.target.value)} // Use handler
               maxLength={2}
               disabled={isDisabled}
               aria-disabled={isDisabled}
               placeholder="e.g., 09"
               // pattern="\d{2}" // Restore if needed
               // title="Enter 2-digit state code"
             />
          </div>
        </div>
      </div>
    </div>
  );
}
