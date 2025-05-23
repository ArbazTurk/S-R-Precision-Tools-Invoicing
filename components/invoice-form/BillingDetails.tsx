"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AutocompleteInput from "@/components/AutocompleteInput";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ClientAddForm from "@/components/ClientAddForm";
import { Client } from "@/types/database";
import { useState } from "react";
// Import AutocompleteOption type correctly
import type { AutocompleteOption } from "@/components/AutocompleteInput";

interface BillingDetailsProps {
  displayedBillingDetails: Partial<Client>; // Receive the details to display/edit
  selectedClientId: string | null; // Still needed to know if a client *is* selected
  fetchClientSuggestions: (query: string) => Promise<AutocompleteOption[]>;
  handleClientSelect: (option: AutocompleteOption) => void;
  handleClientAddSuccess: (client: Client) => void;
  handleDisplayedBillingChange: (field: keyof Client, value: string) => void; // Add handler prop
  // TODO: Add handleSaveTypedClient prop later if needed
}

export default function BillingDetails({
  displayedBillingDetails, // Use displayed details
  selectedClientId,
  fetchClientSuggestions,
  handleClientSelect,
  handleClientAddSuccess,
  handleDisplayedBillingChange, // Destructure handler
}: BillingDetailsProps) {
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  // TODO: Add state and handler for Save button later if needed

  return (
    <div className="border p-4 rounded-lg space-y-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Billed To *</h3>
        {/* Removed Add New Client Dialog */}
      </div>

      <div>
        <Label htmlFor="billed_to_name">Name *</Label>
         <AutocompleteInput
           id="billed_to_name"
           placeholder="Search or type client name..." // Adjust placeholder
           value={displayedBillingDetails.name ?? ""} // Use displayed details state
           // Use the specific handler for the name field
           onChange={(value) => handleDisplayedBillingChange("name", value)}
           onSelect={handleClientSelect} // Pass the selection handler
           fetchSuggestions={fetchClientSuggestions}
        />
        {/* TODO: Add Save button later if needed */}
      </div>

      <div>
        <Label htmlFor="billed_to_address">Address</Label>
        <Input
          id="billed_to_address"
          value={displayedBillingDetails.address || ""} // Use displayed details
          onChange={(e) => handleDisplayedBillingChange("address", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="billed_to_gstin">GSTIN *</Label>
          <Input
            id="billed_to_gstin"
            value={displayedBillingDetails.gstin || ""} // Use displayed details
            onChange={(e) => handleDisplayedBillingChange("gstin", e.target.value)}
            required
            aria-required="true"
            maxLength={15}
            // Basic pattern validation can be added back if needed
            // pattern="^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$"
            // title="Enter valid 15-digit GSTIN (e.g., 09ABCDE1234F1Z5)"
          />
        </div>

        <div>
          <Label htmlFor="billed_to_phone">Phone</Label>
          <Input
            id="billed_to_phone"
            type="tel"
            value={displayedBillingDetails.phone || ""} // Use displayed details
            onChange={(e) => handleDisplayedBillingChange("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="billed_to_state">State</Label>
          <Input
            id="billed_to_state"
            value={displayedBillingDetails.state || ""} // Use displayed details
            onChange={(e) => handleDisplayedBillingChange("state", e.target.value)}
            placeholder="e.g., Uttar Pradesh"
          />
        </div>
        <div>
          <Label htmlFor="billed_to_state_code">State Code</Label>
          <Input
            id="billed_to_state_code"
            value={displayedBillingDetails.state_code || ""} // Use displayed details
            onChange={(e) => handleDisplayedBillingChange("state_code", e.target.value)}
            maxLength={2}
            placeholder="e.g., 09"
            // pattern="\d{2}" // Restore pattern if needed
            // title="Enter 2-digit state code"
          />
        </div>
      </div>
    </div>
  );
}
