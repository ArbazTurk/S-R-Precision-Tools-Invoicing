import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import InvoiceForm from "@/components/InvoiceForm";
import { Invoice, Client, InvoiceItem, Product } from "@/types/database"; // Import necessary types
import type { FullInvoiceForEdit } from "@/hooks/useInvoiceForm"; // Import the type used by the hook

export const dynamic = "force-dynamic";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>; // Update the type to indicate params is a Promise
}

// Make component async and handle params as a Promise
export default async function EditInvoicePage(props: EditInvoicePageProps) {
  // Await the params to get the id
  const params = await props.params;
  const { id } = params; // Now safely destructuring id after awaiting

  const supabase = await createClient();

  // Fetch the invoice by ID with related data using joins
  const { data: invoiceData, error } = await supabase
    .from("invoices")
    .select(
      "*, billed_client:clients!invoices_billed_to_client_id_fkey(*), shipped_client:clients!invoices_shipped_to_client_id_fkey(*), invoice_items(*, products(*))"
    )
    .eq("id", id)
    .single();

  if (error || !invoiceData) {
    console.error("Error fetching invoice:", error);
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        Edit Invoice {invoiceData.invoice_number}
      </h1>
      {/* Pass the fetched data structure to the form */}
      <InvoiceForm
        initialInvoiceData={invoiceData as FullInvoiceForEdit}
        mode="edit"
      />
    </div>
  );
}
