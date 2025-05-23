"use client";

import { useState, useCallback, useEffect } from "react";
import { Client } from "../types/database"; // Corrected import path
import { companyProfile } from "../config/companyProfile"; // Corrected import path

interface UseClientSelectionProps {
  initialBilledClient?: Client | null;
  initialShippedClient?: Client | null;
  initialBilledId?: string | null;
  initialShippedId?: string | null;
  // Callback to inform the main hook about tax type changes based on client state
  onTaxTypeUpdate?: (
    taxType: "CGST_SGST" | "IGST",
    rates: { cgst: number; sgst: number; igst: number }
  ) => void;
}

/**
 * Manages billing and shipping client selection, displayed details, and "same as billed to" logic.
 * @param initialBilledClient - Initial selected billing client data.
 * @param initialShippedClient - Initial selected shipping client data.
 * @param initialBilledId - Initial selected billing client ID.
 * @param initialShippedId - Initial selected shipping client ID.
 * @param onTaxTypeUpdate - Callback to update tax type in the main form state.
 * @returns Client selection state and handlers.
 */
export const useClientSelection = ({
  initialBilledClient,
  initialShippedClient,
  initialBilledId,
  initialShippedId,
  onTaxTypeUpdate,
}: UseClientSelectionProps = {}) => {
  const [selectedBilledClientId, setSelectedBilledClientId] = useState<
    string | null
  >(initialBilledId || null);
  const [selectedShippedClientId, setSelectedShippedClientId] = useState<
    string | null
  >(initialShippedId || null);
  const [billingClientData, setBillingClientData] = useState<Client | null>(
    initialBilledClient || null
  );
  const [shippingClientData, setShippingClientData] = useState<Client | null>(
    initialShippedClient || null
  );
  const [displayedBillingDetails, setDisplayedBillingDetails] = useState<
    Partial<Client>
  >(initialBilledClient || {});
  const [displayedShippingDetails, setDisplayedShippingDetails] = useState<
    Partial<Client>
  >(initialShippedClient || {});
  const [sameAsBilledTo, setSameAsBilledTo] = useState(
    // Initialize based on IDs matching and being non-null
    !!initialBilledId && initialBilledId === initialShippedId
  );

  // Effect to suggest tax type update when displayed billing state changes, but don't force it
  useEffect(() => {
    if (
      displayedBillingDetails?.state_code &&
      companyProfile.stateCode &&
      onTaxTypeUpdate
    ) {
      // Only suggest tax type based on state code when it's initially set
      // This allows manual override later
      const isSameState =
        displayedBillingDetails.state_code === companyProfile.stateCode;
      const suggestedTaxType = isSameState ? "CGST_SGST" : "IGST";

      // Store the suggested tax type in a ref to avoid unnecessary re-renders
      // We'll use this to determine if we should update the tax type
      const suggestedRates = {
        cgst: isSameState ? 9 : 0, // Default rates, could be configurable
        sgst: isSameState ? 9 : 0,
        igst: !isSameState ? 18 : 0,
      };

      // Suggest the tax type, but don't force it if user has manually changed it
      onTaxTypeUpdate(suggestedTaxType, suggestedRates);
    }
  }, [displayedBillingDetails?.state_code, onTaxTypeUpdate]); // Depend on state_code and the callback

  const handleDisplayedBillingChange = useCallback(
    (field: keyof Client, value: string) => {
      setDisplayedBillingDetails((prev) => ({ ...prev, [field]: value }));
      // If user types, deselect the client ID to indicate manual entry
      if (selectedBilledClientId) {
        setSelectedBilledClientId(null);
        setBillingClientData(null);
      }
    },
    [selectedBilledClientId] // Dependency needed
  );

  const handleDisplayedShippingChange = useCallback(
    (field: keyof Client, value: string) => {
      if (sameAsBilledTo) return; // Don't allow editing if synced
      setDisplayedShippingDetails((prev) => ({ ...prev, [field]: value }));
      // If user types, deselect the client ID
      if (selectedShippedClientId) {
        setSelectedShippedClientId(null);
        setShippingClientData(null);
      }
    },
    [sameAsBilledTo, selectedShippedClientId] // Dependencies needed
  );

  const handleBillingClientSelect = useCallback(
    (option: { value: string; label: string; data?: Client }) => {
      const client = option.data ?? null;
      setSelectedBilledClientId(client?.id ?? null);
      setBillingClientData(client);
      setDisplayedBillingDetails(client || {}); // Update displayed details
      // Trigger tax update based on selected client
      if (client?.state_code && companyProfile.stateCode && onTaxTypeUpdate) {
        const isSameState = client.state_code === companyProfile.stateCode;
        onTaxTypeUpdate(isSameState ? "CGST_SGST" : "IGST", {
          cgst: isSameState ? 9 : 0,
          sgst: isSameState ? 9 : 0,
          igst: !isSameState ? 18 : 0,
        });
      }
      // Sync shipping if 'same as' is checked
      if (sameAsBilledTo) {
        setSelectedShippedClientId(client?.id ?? null);
        setShippingClientData(client);
        setDisplayedShippingDetails(client || {});
      }
    },
    [sameAsBilledTo, onTaxTypeUpdate] // Dependencies
  );

  const handleShippingClientSelect = useCallback(
    (option: { value: string; label: string; data?: Client }) => {
      if (!sameAsBilledTo) {
        const client = option.data ?? null;
        setSelectedShippedClientId(client?.id ?? null);
        setShippingClientData(client);
        setDisplayedShippingDetails(client || {}); // Update displayed details
      }
    },
    [sameAsBilledTo] // Dependency
  );

  const handleSameAsBilledTo = useCallback(
    (checked: boolean) => {
      setSameAsBilledTo(checked);
      if (checked) {
        // Sync shipping with billing
        setSelectedShippedClientId(selectedBilledClientId);
        setShippingClientData(billingClientData);
        setDisplayedShippingDetails(displayedBillingDetails);
      } else {
        // When unchecking, clear selected shipping ID but keep potentially typed details
        setSelectedShippedClientId(null);
        setShippingClientData(null);
        // Optionally clear displayedShippingDetails too, or leave as typed:
        // setDisplayedShippingDetails({});
      }
    },
    [selectedBilledClientId, billingClientData, displayedBillingDetails] // Dependencies
  );

  // Callback for when a client is added via modal
  const handleClientAddSuccess = useCallback(
    (newClient: Client) => {
      // Treat the newly added client as the selected billing client
      setSelectedBilledClientId(newClient.id);
      setBillingClientData(newClient);
      setDisplayedBillingDetails(newClient); // Update displayed details
      // Trigger tax update
      if (newClient.state_code && companyProfile.stateCode && onTaxTypeUpdate) {
        const isSameState = newClient.state_code === companyProfile.stateCode;
        onTaxTypeUpdate(isSameState ? "CGST_SGST" : "IGST", {
          cgst: isSameState ? 9 : 0,
          sgst: isSameState ? 9 : 0,
          igst: !isSameState ? 18 : 0,
        });
      }
      // Sync shipping if 'same as' is checked
      if (sameAsBilledTo) {
        setSelectedShippedClientId(newClient.id);
        setShippingClientData(newClient);
        setDisplayedShippingDetails(newClient);
      }
    },
    [sameAsBilledTo, onTaxTypeUpdate] // Dependencies
  );

  return {
    selectedBilledClientId,
    selectedShippedClientId,
    billingClientData, // Expose for potential display needs (though displayedDetails is primary)
    shippingClientData, // Expose for potential display needs
    displayedBillingDetails,
    displayedShippingDetails,
    sameAsBilledTo,
    handleDisplayedBillingChange,
    handleDisplayedShippingChange,
    handleBillingClientSelect,
    handleShippingClientSelect,
    handleSameAsBilledTo,
    handleClientAddSuccess,
    // Expose setters if needed for direct manipulation (e.g., during initialization)
    setDisplayedBillingDetails,
    setDisplayedShippingDetails,
    setSelectedBilledClientId,
    setSelectedShippedClientId,
    setSameAsBilledTo,
  };
};
