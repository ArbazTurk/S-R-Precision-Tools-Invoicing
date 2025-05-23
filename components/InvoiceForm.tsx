"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // Corrected path to hooks directory
import { Invoice, InvoiceItem, Client } from "@/types/database"; // Added Client import
import { Loader2, ArrowLeft } from "lucide-react"; // Added ArrowLeft icon for back button
import Link from "next/link"; // Import Link for navigation

// Import sub-components
import InvoiceMetadata from "./invoice-form/InvoiceMetadata";
import BillingDetails from "./invoice-form/BillingDetails";
import ShippingDetails from "./invoice-form/ShippingDetails";
import InvoiceItemsList from "./invoice-form/InvoiceItemsList";
import InvoiceTotals from "./invoice-form/InvoiceTotals";

// Import the custom hook
import { useInvoiceForm, FullInvoiceForEdit } from "@/hooks/useInvoiceForm"; // Import FullInvoiceForEdit type

interface InvoiceFormProps {
  initialInvoiceData?: FullInvoiceForEdit; // Use the correct prop name and type
  mode: "create" | "edit";
}

export default function InvoiceForm({
  initialInvoiceData, // Use the correct prop name
  mode,
}: InvoiceFormProps) {
  const { toast } = useToast();
  const {
    // State
    formData,
    items,
    itemProductDataMap,
    sameAsBilledTo,
    loading,
    submitting,
    error,
    transportModes,
    selectedTransportMode,
    otherTransportMode,
    displayedBillingDetails, // Get displayed details state
    displayedShippingDetails, // Get displayed details state
    selectedBilledClientId,
    selectedShippedClientId,

    // Handlers
    handleChange,
    handleSelectChange,
    handleTransportModeChange,
    handleOtherTransportModeChange,
    handleDisplayedBillingChange, // Get new handler
    handleDisplayedShippingChange, // Get new handler
    handleBillingClientSelect,
    handleShippingClientSelect,
    handleSameAsBilledTo,
    handleItemChange,
    addItemRow,
    removeItemRow,
    handleProductSelect,
    handlePackingChargesChange,
    handleTaxTypeChange,
    handleTaxRateChange,
    handleClientAddSuccess,
    handleProductAddSuccess,
    handleSubmit,
    amountToWords,

    // Fetchers
    fetchClientSuggestions,
    fetchProductSuggestions,
  } = useInvoiceForm({ initialInvoiceData, mode }); // Pass the correct prop name

  // Display loading indicator while fetching initial data
  if (loading && mode === "edit") {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Invoice Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Back Button */}
      <div className="flex items-center mb-4">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display General Error */}
        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-4"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* --- Render Sub-components --- */}

        <InvoiceMetadata
          formData={formData}
          handleChange={handleChange}
          handleSelectChange={handleSelectChange}
          transportModes={transportModes}
          selectedTransportMode={selectedTransportMode}
          handleTransportModeChange={handleTransportModeChange}
          otherTransportMode={otherTransportMode}
          handleOtherTransportModeChange={handleOtherTransportModeChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BillingDetails
            displayedBillingDetails={displayedBillingDetails} // Pass displayed details
            selectedClientId={selectedBilledClientId}
            fetchClientSuggestions={fetchClientSuggestions}
            handleClientSelect={handleBillingClientSelect}
            handleClientAddSuccess={handleClientAddSuccess}
            handleDisplayedBillingChange={handleDisplayedBillingChange} // Pass handler
          />
          <ShippingDetails
            displayedShippingDetails={displayedShippingDetails} // Pass displayed details
            selectedClientId={selectedShippedClientId}
            sameAsBilledTo={sameAsBilledTo}
            handleSameAsBilledTo={handleSameAsBilledTo}
            fetchClientSuggestions={fetchClientSuggestions}
            handleClientSelect={handleShippingClientSelect}
            handleDisplayedShippingChange={handleDisplayedShippingChange} // Pass handler
          />
        </div>

        <InvoiceItemsList
          items={items}
          itemProductDataMap={itemProductDataMap}
          handleItemChange={handleItemChange}
          addItemRow={addItemRow}
          removeItemRow={removeItemRow}
          fetchProductSuggestions={fetchProductSuggestions}
          handleProductSelect={handleProductSelect}
          handleProductAddSuccess={handleProductAddSuccess}
        />

        <InvoiceTotals
          formData={formData}
          handlePackingChargesChange={handlePackingChargesChange}
          handleTaxTypeChange={handleTaxTypeChange}
          handleTaxRateChange={handleTaxRateChange}
          amountToWords={amountToWords}
        />

        {/* --- Submission Button --- */}
        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === "create" ? (
              "Create Invoice"
            ) : (
              "Update Invoice"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
