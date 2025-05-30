import { createClient } from "@/utils/supabase/server";
import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardClient from "./client";

export const dynamic = "force-dynamic";

// Helper function to parse dd/mm/yyyy to yyyy-mm-dd
function parseDateDDMMYYYY(dateString: string): string | null {
  const parts = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!parts) return null;
  const day = parseInt(parts[1], 10);
  const month = parseInt(parts[2], 10);
  const year = parseInt(parts[3], 10);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null; // Basic validation

  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;
  return `${year}-${formattedMonth}-${formattedDay}`;
}

export default async function DashboardPage({
  searchParams: searchParamsFromProps,
}: {
  searchParams?: Promise<{ page?: string; query?: string }>;
}) {
  const searchParams = await searchParamsFromProps;
  const supabase = await createClient();
  const currentPage = Number(searchParams?.page) || 1;
  const itemsPerPage = 7;
  const query = searchParams?.query || "";

  let invoices = [];
  let totalInvoices = 0;

  if (query) {
    const parsedDate = parseDateDDMMYYYY(query);
    if (parsedDate) {
      // Search by invoice_date
      const { data, error, count } = await supabase
        .from("invoices")
        .select(
          "*, billed_client:clients!invoices_billed_to_client_id_fkey(id, name)",
          { count: "exact" }
        )
        .eq("invoice_date", parsedDate)
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

      if (error) {
        console.error("Error fetching invoices by date:", error);
      } else {
        invoices = data || [];
        totalInvoices = count || 0;
      }
    } else {
      // Step 1: Find clients whose name matches the query
      const { data: matchingClients, error: clientError } = await supabase
        .from("clients")
        .select("id")
        .ilike("name", `%${query}%`);

      if (clientError) {
        console.error("Error fetching matching clients:", clientError);
      }

      const clientIds = matchingClients?.map((client) => client.id) || [];

      // Step 2: Fetch invoices by invoice_number or matching client IDs
      const { data, error, count } = await supabase
        .from("invoices")
        .select(
          "*, billed_client:clients!invoices_billed_to_client_id_fkey(id, name)",
          { count: "exact" }
        )
        .or(
          `invoice_number.ilike.%${query}%,billed_to_client_id.in.(${clientIds.join(
            ","
          )})`
        )
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

      if (error) {
        console.error("Error fetching invoices by query:", error);
      } else {
        invoices = data || [];
        totalInvoices = count || 0;
      }
    }
  } else {
    // No query, fetch all invoices
    const { data, error, count } = await supabase
      .from("invoices")
      .select(
        "*, billed_client:clients!invoices_billed_to_client_id_fkey(id, name)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

    if (error) {
      console.error("Error fetching all invoices:", error);
    } else {
      invoices = data || [];
      totalInvoices = count || 0;
    }
  }

  return (
    <div className="container mx-auto pt-8 pb-4 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Invoices Dashboard</h1>
        <div className="flex w-full sm:w-auto justify-between sm:justify-end gap-2 sm:gap-4">
          <form action={signOutAction} className="flex-shrink-0">
            <Button variant="outline" size="sm" className="text-sm">Logout</Button>
          </form>
          <Link href="/create-invoice" className="flex-shrink-0">
            <Button size="sm" className="text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Create
            </Button>
          </Link>
        </div>
      </div>

      <DashboardClient
        initialInvoices={invoices}
        totalInvoices={totalInvoices}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        currentQuery={query}
      />
    </div>
  );
}
