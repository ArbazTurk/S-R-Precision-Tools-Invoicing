import { createClient } from "@/utils/supabase/server";
import { fetchNextInvoiceNumber } from "@/lib/invoiceUtils"; // Keep if needed elsewhere, or remove if only for emptyInvoice
import InvoiceForm from "@/components/InvoiceForm";
// import { Invoice } from "@/types/database"; // No longer needed for emptyInvoice

export const dynamic = "force-dynamic"; // Keep if page needs dynamic rendering

export default async function CreateInvoicePage() {
  // const supabase = await createClient(); // Not needed if fetchNextInvoiceNumber is removed or handled differently
  // const nextInvoiceNumber = await fetchNextInvoiceNumber(); // Hook handles fetching number now

  // No need to create emptyInvoice here, the hook handles defaults for create mode

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      {/* Pass only the mode prop; initialInvoiceData is undefined for create */}
      <InvoiceForm mode="create" />
    </div>
  );
}
