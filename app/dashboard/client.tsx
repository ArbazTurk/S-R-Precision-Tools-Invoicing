"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InvoiceFilter from "@/components/InvoiceFilter";
import { Invoice, InvoiceItem, Client, Product } from "@/types/database"; // Import Client and Product
import { createClient } from "@/utils/supabase/client";
import { PDFDownloadButton } from "@/components/InvoicePDF";
import { formatDateDDMMYYYY } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Define the expected structure for invoices coming from the server page
interface InvoiceWithClient extends Omit<Invoice, "billed_client"> {
  // Omit the optional Client type from base Invoice
  billed_client: Pick<Client, "id" | "name"> | null; // Expect only id and name from the join
}

// Define the structure needed for PDF generation
interface InvoiceWithRelationsForPDF extends Invoice {
  billed_client: Client | null;
  shipped_client: Client | null;
  invoice_items: (InvoiceItem & { products: Product | null })[];
}

interface DashboardClientProps {
  initialInvoices: InvoiceWithClient[];
  totalInvoices: number;
  currentPage: number;
  itemsPerPage: number;
  currentQuery: string;
}

export default function DashboardClient({
  initialInvoices,
  totalInvoices,
  currentPage: initialCurrentPage,
  itemsPerPage,
  currentQuery: initialQuery,
}: DashboardClientProps) {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams(); // To construct new URLs easily

  // State for the invoices currently displayed on the page
  const [displayedInvoices, setDisplayedInvoices] =
    useState<InvoiceWithClient[]>(initialInvoices);
  // State for the current page, initialized from props
  const [currentPage, setCurrentPage] = useState<number>(initialCurrentPage);
  // State for the current search query, initialized from props
  const [currentSearchQuery, setCurrentSearchQuery] =
    useState<string>(initialQuery);
  // State to hold the full data needed for PDF generation, mapped by invoice ID
  const [invoiceDataForPDF, setInvoiceDataForPDF] = useState<
    Record<string, InvoiceWithRelationsForPDF>
  >({});
  // Invoice type state per invoice
  const [invoiceTypeMap, setInvoiceTypeMap] = useState<
    Record<string, "original" | "duplicate" | "triplicate">
  >({});
  // New state to track which invoice ID should trigger download
  const [invoiceToDownload, setInvoiceToDownload] = useState<string | null>(
    null
  );
  // State to track which invoice is currently being downloaded
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(
    null
  );

  // Update displayed invoices and current page if props change (e.g., direct URL navigation)
  useEffect(() => {
    setDisplayedInvoices(initialInvoices);
    setCurrentPage(initialCurrentPage);
    setCurrentSearchQuery(initialQuery);
  }, [initialInvoices, initialCurrentPage, initialQuery]);

  // New useEffect to trigger download when invoiceDataForPDF updates
  useEffect(() => {
    if (invoiceToDownload && invoiceDataForPDF[invoiceToDownload]) {
      // Find and click the download button programmatically
      const downloadButton = document.querySelector(
        `[data-invoice-id="${invoiceToDownload}"] a`
      );
      if (downloadButton) {
        (downloadButton as HTMLElement).click();
      }
      // Reset invoiceToDownload to prevent re-triggering
      setInvoiceToDownload(null);
    }
  }, [invoiceDataForPDF, invoiceToDownload]);

  // Fetch full invoice data (including relations) for PDF generation
  const fetchInvoiceDataForPDF = async (
    invoiceId: string
  ): Promise<InvoiceWithRelationsForPDF | null> => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          "*, billed_client:clients!invoices_billed_to_client_id_fkey(*), shipped_client:clients!invoices_shipped_to_client_id_fkey(*), invoice_items(*, products(*))"
        )
        .eq("id", invoiceId)
        .single();

      if (error) {
        console.error(
          `Error fetching full invoice data for ${invoiceId}:`,
          error
        );
        // Optionally show a toast message to the user
        return null;
      }

      if (data) {
        console.log(`Fetched full data for invoice ${invoiceId}`);
        const invoiceData = data as InvoiceWithRelationsForPDF;
        setInvoiceDataForPDF((prev) => ({
          ...prev,
          [invoiceId]: invoiceData,
        }));
        return invoiceData;
      } else {
        console.log(`No full data found for invoice ${invoiceId}.`);
        return null;
      }
    } catch (err) {
      console.error("Error in fetchInvoiceDataForPDF:", err);
      return null;
    }
  };

  const handleFilter = (query: string) => {
    setCurrentSearchQuery(query);
    const params = new URLSearchParams(searchParams.toString()); // Use searchParams.toString() to get current params
    if (query.trim()) {
      params.set("query", query.trim());
    } else {
      params.delete("query");
    }
    params.set("page", "1"); // Reset to page 1 on new search
    router.push(`/dashboard?${params.toString()}`);
  };

  // Calculate pagination values based on props from server
  const totalPages = Math.ceil(totalInvoices / itemsPerPage);
  // These are for display purposes, actual data slicing is done on server
  const indexOfLastInvoice = currentPage * itemsPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - itemsPerPage;

  // Change page
  const navigateToPage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString()); // Use searchParams.toString()
    params.set("page", pageNumber.toString());
    // currentSearchQuery should be used here, not initialQuery
    if (currentSearchQuery.trim()) {
      params.set("query", currentSearchQuery.trim());
    } else {
      params.delete("query"); // Ensure query is removed if empty
    }
    router.push(`/dashboard?${params.toString()}`);
  };

  const paginate = (pageNumber: number) => navigateToPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) {
      navigateToPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      navigateToPage(currentPage - 1);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <InvoiceFilter onFilter={handleFilter} />
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Invoice No.
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Client Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedInvoices.length > 0 ? (
              displayedInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoice_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateDDMMYYYY(invoice.invoice_date)}{" "}
                    {/* Use the utility function */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* Display the joined client name */}
                    {invoice.billed_client?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{invoice.total_amount_after_tax?.toFixed(2) || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link href={`/invoice/${invoice.id}/edit`}>
                        <Button variant="outline" size="sm">
                          View/Edit
                        </Button>
                      </Link>
                      {/* Combined fetch and download button */}
                      <div className="flex items-center space-x-2">
                        <select
                          className="border rounded px-2 py-1 text-sm bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={invoiceTypeMap[invoice.id] || "original"}
                          onChange={(e) => {
                            setInvoiceTypeMap((prev) => ({
                              ...prev,
                              [invoice.id]: e.target.value as
                                | "original"
                                | "duplicate"
                                | "triplicate",
                            }));
                          }}
                        >
                          <option value="original">Original</option>
                          <option value="duplicate">Duplicate</option>
                          <option value="triplicate">Triplicate</option>
                        </select>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={downloadingInvoice === invoice.id}
                          onClick={async () => {
                            setDownloadingInvoice(invoice.id);
                            try {
                              if (!invoiceDataForPDF[invoice.id]) {
                                const fetchedData =
                                  await fetchInvoiceDataForPDF(invoice.id);
                                if (fetchedData) {
                                  // Small delay to ensure state update is processed
                                  setTimeout(() => {
                                    setInvoiceToDownload(invoice.id);
                                    setDownloadingInvoice(null);
                                  }, 600);
                                } else {
                                  setDownloadingInvoice(null);
                                }
                              } else {
                                // If data already exists, set invoiceToDownload directly
                                setInvoiceToDownload(invoice.id);
                                setDownloadingInvoice(null);
                              }
                            } catch (error) {
                              console.error("Download error:", error);
                              setDownloadingInvoice(null);
                            }
                          }}
                        >
                          {downloadingInvoice === invoice.id ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mr-2"
                              >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              Download PDF
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Hidden actual download button that gets triggered */}
                      <div className="hidden" data-invoice-id={invoice.id}>
                        {invoiceDataForPDF[invoice.id] && (
                          <PDFDownloadButton
                            invoiceData={invoiceDataForPDF[invoice.id]}
                            invoiceType={
                              invoiceTypeMap[invoice.id] || "original"
                            }
                          />
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5} // Ensure this matches the number of <th> elements
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No invoices found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4">
        {displayedInvoices.length > 0 ? (
          displayedInvoices.map((invoice) => (
            <div key={invoice.id} className="bg-white shadow-md rounded-lg p-4">
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800">
                    {invoice.invoice_number}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDateDDMMYYYY(invoice.invoice_date)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {invoice.billed_client?.name || "-"}
                </p>
                <p className="text-sm font-medium text-gray-700">
                  ₹{invoice.total_amount_after_tax?.toFixed(2) || "-"}
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Link href={`/invoice/${invoice.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full text-sm">
                    View/Edit
                  </Button>
                </Link>
                <div className="relative w-full">
                  <select
                    className="w-full border rounded py-1 text-center text-sm font-medium bg-white text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={invoiceTypeMap[invoice.id] || "original"}
                    onChange={(e) => {
                      setInvoiceTypeMap((prev) => ({
                        ...prev,
                        [invoice.id]: e.target.value as
                          | "original"
                          | "duplicate"
                          | "triplicate",
                      }));
                    }}
                  >
                    <option value="original">Original</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="triplicate">Triplicate</option>
                  </select>
                  {/* <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span> */}
                </div>
                <Button
                  variant="outline"
                  className="w-full text-sm flex items-center justify-center"
                  disabled={downloadingInvoice === invoice.id}
                  onClick={async () => {
                    setDownloadingInvoice(invoice.id);
                    try {
                      if (!invoiceDataForPDF[invoice.id]) {
                        const fetchedData = await fetchInvoiceDataForPDF(
                          invoice.id
                        );
                        if (fetchedData) {
                          setTimeout(() => {
                            setInvoiceToDownload(invoice.id);
                            setDownloadingInvoice(null);
                          }, 600);
                        } else {
                          setDownloadingInvoice(null);
                        }
                      } else {
                        setInvoiceToDownload(invoice.id);
                        setDownloadingInvoice(null);
                      }
                    } catch (error) {
                      console.error("Download error:", error);
                      setDownloadingInvoice(null);
                    }
                  }}
                >
                  {downloadingInvoice === invoice.id ? (
                    <>
                      <svg
                        className="animate-spin mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download PDF
                    </>
                  )}
                </Button>
                {/* Hidden download button for mobile */}
                <div className="hidden" data-invoice-id={invoice.id}>
                  {invoiceDataForPDF[invoice.id] && (
                    <PDFDownloadButton
                      invoiceData={invoiceDataForPDF[invoice.id]}
                      invoiceType={invoiceTypeMap[invoice.id] || "original"}
                    />
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4 text-center text-sm text-gray-500">
            No invoices found matching your search
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      {totalInvoices > 0 && totalPages > 1 && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
          {/* Mobile pagination */}
          <div className="flex justify-between items-center mb-3 md:hidden">
            <p className="text-xs text-gray-700">
              {Math.min(indexOfFirstInvoice + 1, totalInvoices)}-
              {Math.min(indexOfLastInvoice, totalInvoices)} of {totalInvoices}
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={prevPage}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="px-2 py-1 h-8 min-w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center text-sm font-medium">
                {currentPage} / {totalPages}
              </span>
              <Button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="px-2 py-1 h-8 min-w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop pagination */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {Math.min(indexOfFirstInvoice + 1, totalInvoices)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastInvoice, totalInvoices)}
                </span>{" "}
                of <span className="font-medium">{totalInvoices}</span> Invoices
              </p>
            </div>
            <div>
              <nav
                className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <Button
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="icon"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <Button
                      key={number}
                      onClick={() => paginate(number)}
                      variant={currentPage === number ? "default" : "outline"}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === number ? "bg-primary text-white" : "text-gray-900"} ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0`}
                    >
                      {number}
                    </Button>
                  )
                )}

                <Button
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="icon"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
