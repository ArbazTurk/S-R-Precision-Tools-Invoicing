"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
} from "@react-pdf/renderer";
import { Invoice, InvoiceItem, Client, Product } from "@/types/database"; // Import Client and Product
import { companyProfile } from "@/config/companyProfile";
import { Button } from "@/components/ui/button"; // Import Button
import { cn } from "@/lib/utils"; // Import cn for merging classes

// Register Noto Sans font family
Font.register({
  family: "NotoSans",
  fonts: [
    {
      src: "/fonts/NotoSans-Regular.ttf",
      fontWeight: "normal",
      fontStyle: "normal",
    },
    {
      src: "/fonts/NotoSans-Italic.ttf",
      fontWeight: "normal",
      fontStyle: "italic",
    },
    {
      src: "/fonts/NotoSans-Bold.ttf",
      fontWeight: "bold",
      fontStyle: "normal",
    },
    {
      src: "/fonts/NotoSans-BoldItalic.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 15,
    paddingBottom: 30, // Added padding to the bottom
    fontFamily: "NotoSans",
    fontSize: 10,
  },
  header: {
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
    paddingHorizontal: 15,
    color: "#CC0000",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
    color: "#CC0000",
  },
  companyAddress: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
    color: "#CC0000",
  },
  companyContact: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
    color: "#CC0000",
  },
  companyGstin: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
    fontWeight: "bold",
    color: "#CC0000",
  },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 5,
    textDecoration: "underline",
  },
  section: {
    margin: 5,
    padding: 5,
  },
  clientSection: {
    flexDirection: "row",
    marginVertical: 5,
    borderBottom: "1pt solid #CCCCCC",
    paddingBottom: 5,
  },
  clientColumn: {
    flex: 1,
    marginHorizontal: 3,
  },
  clientTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  clientInfo: {
    fontSize: 10,
    marginBottom: 3,
  },
  metadataSection: {
    flexDirection: "row",
    marginVertical: 5,
  },
  metadataColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  metadataRow: {
    flexDirection: "row",
    marginBottom: 5,
  },
  metadataLabel: {
    fontSize: 10,
    fontWeight: "bold",
    width: 120,
  },
  metadataValue: {
    fontSize: 10,
    paddingLeft: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    backgroundColor: "#EEEEEE",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
    fontWeight: "bold",
    fontSize: 10,
  },
  tableCol: {
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 5,
    fontSize: 10,
  },
  tableHeaderRow: {
    backgroundColor: "#EEEEEE",
    borderBottom: "1pt solid #000000",
  },
  tableDataRow: {
    borderBottom: "1pt solid #CCCCCC",
  },
  srNoCol: { width: "5%" },
  descriptionCol: { width: "45%" },
  hsnCol: { width: "10%" },
  qtyCol: { width: "10%" },
  rateCol: { width: "15%" },
  amountCol: { width: "15%" },
  totalsSection: {
    flex: 1,
    marginHorizontal: 5,
    borderTop: "1pt solid #CCCCCC",
    paddingTop: 10,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalsLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  totalsValue: {
    fontSize: 10,
    textAlign: "right",
  },
  amountInWords: {
    fontSize: 10,
    fontStyle: "italic",
    fontWeight: "bold",
    marginVertical: 5,
  },
  bankDetails: {
    flex: 1,
    marginHorizontal: 5,
    borderTop: "1pt solid #CCCCCC",
    paddingTop: 5,
  },
  bankTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 3,
  },
  bankInfo: {
    fontSize: 10,
    marginBottom: 3,
  },
  termsSection: {
    marginVertical: 5,
    borderTop: "1pt solid #CCCCCC",
    paddingTop: 5,
    marginBottom: 5,
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 3,
  },
  termsText: {
    fontSize: 10,
    marginBottom: 3,
  },
  signatureSection: {
    marginTop: 20,
    flexDirection: "row",
  },
  signatureColumn: {
    flex: 1,
    alignItems: "center",
  },
  signatureLine: {
    borderTop: "1pt solid #000000",
    width: 150,
    marginBottom: 3,
  },
  signatureText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  invoiceTypeContainer: {
    flexDirection: "row",
    marginVertical: 5,
    borderBottom: "1pt solid #CCCCCC",
  },
  invoiceTypeView: {
    flex: 1,
    alignItems: "flex-start",
  },
  invoiceTypeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  detailsContainer: {
    flexDirection: "row",
    marginVertical: 10,
    borderTop: "1pt solid #CCCCCC",
    paddingTop: 10,
  },
  bankDetailsContainer: {
    flex: 1,
    paddingRight: 10,
  },
  totalsContainer: {
    flex: 1,
    borderLeft: "1pt solid #CCCCCC",
    paddingLeft: 10,
  },
  totalAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    borderTop: "1pt solid #CCCCCC",
    paddingTop: 3,
  },
  totalAmountText: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
  },
});

// Define the expected data structure with joined relations
interface InvoiceWithRelations extends Invoice {
  billed_client: Client | null;
  shipped_client: Client | null;
  invoice_items: (InvoiceItem & { products: Product | null })[];
}

interface InvoicePDFProps {
  invoiceData: InvoiceWithRelations; // Use the combined type
  invoiceType?: "original" | "duplicate" | "triplicate";
}

// PDF Document Component
const InvoicePDFDocument = ({
  invoiceData,
  invoiceType = "original",
}: InvoicePDFProps) => {
  // Destructure for easier access
  const {
    invoice_items: items,
    billed_client,
    shipped_client,
    ...invoice
  } = invoiceData;

  // Invoice type heading logic
  let invoiceTypeText = "";
  if (invoiceType === "original") invoiceTypeText = "ORIGINAL FOR RECIPIENT";
  else if (invoiceType === "duplicate")
    invoiceTypeText = "DUPLICATE FOR TRANSPORTER";
  else if (invoiceType === "triplicate")
    invoiceTypeText = "TRIPLICATE FOR SUPPLIER";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={{ flexGrow: 1 }}>
          {/* Wrap main content */}
          {/* Header with Company Information */}
          <View style={styles.header}>
            <Text style={styles.companyName}>{companyProfile.companyName}</Text>
            <Text style={styles.companyAddress}>
              {companyProfile.addressLine1}
            </Text>
            <Text style={styles.companyAddress}>
              {companyProfile.addressLine2}
            </Text>
            <Text style={styles.companyContact}>
              Mobile: {companyProfile.mobile} | Email: {companyProfile.email}
            </Text>
            <Text style={styles.companyGstin}>
              GSTIN: {companyProfile.gstin}
            </Text>
          </View>
          {/* Invoice Type and Tax Invoice Heading */}
          <View style={styles.invoiceTypeContainer}>
            <View style={styles.invoiceTypeView}>
              <Text style={styles.invoiceTypeText}>TAX INVOICE</Text>
            </View>
            <View style={[styles.invoiceTypeView, { alignItems: "flex-end" }]}>
              <Text style={styles.invoiceTypeText}>{invoiceTypeText}</Text>
            </View>
          </View>
          {/* Client Information */}
          <View style={styles.clientSection}>
            <View style={styles.clientColumn}>
              <Text style={styles.clientTitle}>Billed To:</Text>
              <Text style={styles.clientInfo}>
                {billed_client?.name || "N/A"}
              </Text>
              <Text style={styles.clientInfo}>
                {billed_client?.address || ""}
              </Text>
              {billed_client?.gstin && (
                <Text style={styles.clientInfo}>
                  GSTIN: {billed_client.gstin}
                </Text>
              )}
              {billed_client?.phone && (
                <Text style={styles.clientInfo}>
                  Phone: {billed_client.phone}
                </Text>
              )}
              {billed_client?.state && (
                <Text style={styles.clientInfo}>
                  State: {billed_client.state} ({billed_client.state_code})
                </Text>
              )}
            </View>

            <View style={styles.clientColumn}>
              <Text style={styles.clientTitle}>Shipped To:</Text>
              <Text style={styles.clientInfo}>
                {shipped_client?.name || "N/A"}
              </Text>
              <Text style={styles.clientInfo}>
                {shipped_client?.address || ""}
              </Text>
              {shipped_client?.gstin && (
                <Text style={styles.clientInfo}>
                  GSTIN: {shipped_client.gstin}
                </Text>
              )}
              {shipped_client?.phone && (
                <Text style={styles.clientInfo}>
                  Phone: {shipped_client.phone}
                </Text>
              )}
              {shipped_client?.state && (
                <Text style={styles.clientInfo}>
                  State: {shipped_client.state} ({shipped_client.state_code})
                </Text>
              )}
            </View>
          </View>
          {/* Invoice Metadata */}
          <View style={styles.metadataSection}>
            <View style={styles.metadataColumn}>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Invoice No:</Text>
                <Text style={styles.metadataValue}>
                  {invoice.invoice_number}
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Invoice Date:</Text>
                <Text style={styles.metadataValue}>
                  {new Date(invoice.invoice_date).toLocaleDateString("en-IN")}
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Order Date:</Text>
                <Text style={styles.metadataValue}>
                  {invoice.order_date
                    ? new Date(invoice.order_date).toLocaleDateString("en-IN")
                    : "N/A"}
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Date & Time of Supply:</Text>
                <Text style={styles.metadataValue}>
                  {invoice.supply_date_time
                    ? (() => {
                        const date = new Date(invoice.supply_date_time);
                        const day = date
                          .getUTCDate()
                          .toString()
                          .padStart(2, "0");
                        const month = (date.getUTCMonth() + 1)
                          .toString()
                          .padStart(2, "0");
                        const year = date.getUTCFullYear();
                        const hours = date.getUTCHours();
                        const minutes = date
                          .getUTCMinutes()
                          .toString()
                          .padStart(2, "0");
                        const formattedHours = (hours % 12 || 12)
                          .toString()
                          .padStart(2, "0");
                        const amPm = hours >= 12 ? "PM" : "AM";
                        return `${day}/${month}/${year} ${formattedHours}:${minutes} ${amPm}`;
                      })()
                    : "N/A"}
                </Text>
              </View>
            </View>

            <View style={styles.metadataColumn}>
              {invoice.po_rgp_no && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>P.O./RGP No:</Text>
                  <Text style={styles.metadataValue}>{invoice.po_rgp_no}</Text>
                </View>
              )}
              {invoice.transport_mode && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Transport Mode:</Text>
                  <Text style={styles.metadataValue}>
                    {invoice.transport_mode}
                  </Text>
                </View>
              )}
              {invoice.vehicle_number && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Vehicle No:</Text>
                  <Text style={styles.metadataValue}>
                    {invoice.vehicle_number}
                  </Text>
                </View>
              )}
              {invoice.place_of_supply && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>Place of Supply:</Text>
                  <Text style={styles.metadataValue}>
                    {invoice.place_of_supply}
                  </Text>
                </View>
              )}
              {/* Supply Date/Time moved to first column */}
              {/* Removed Reverse Charge display */}
            </View>
          </View>
          {/* Items Table */}
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <View style={[styles.tableColHeader, styles.srNoCol]}>
                <Text>Sr. No.</Text>
              </View>
              <View style={[styles.tableColHeader, styles.descriptionCol]}>
                <Text>Description</Text>
              </View>
              <View style={[styles.tableColHeader, styles.hsnCol]}>
                <Text>HSN/SAC</Text>
              </View>
              <View style={[styles.tableColHeader, styles.qtyCol]}>
                <Text>Qty</Text>
              </View>
              <View style={[styles.tableColHeader, styles.rateCol]}>
                <Text>Rate (₹)</Text>
              </View>
              <View style={[styles.tableColHeader, styles.amountCol]}>
                <Text>Amount (₹)</Text>
              </View>
            </View>

            {/* Table Rows */}
            {items.map((item, index) => (
              <View key={index} style={[styles.tableRow, styles.tableDataRow]}>
                <View style={[styles.tableCol, styles.srNoCol]}>
                  <Text>{index + 1}</Text>
                </View>
                <View style={[styles.tableCol, styles.descriptionCol]}>
                  {/* Access product name via nested relation */}
                  <Text>{item.products?.name || "N/A"}</Text>
                </View>
                <View style={[styles.tableCol, styles.hsnCol]}>
                  {/* Access HSN via nested relation */}
                  <Text>{item.products?.hsn_sac_code || "-"}</Text>
                </View>
                <View style={[styles.tableCol, styles.qtyCol]}>
                  <Text>{item.quantity}</Text>
                </View>
                <View style={[styles.tableCol, styles.rateCol]}>
                  <Text>{item.rate.toFixed(2)}</Text>
                </View>
                <View style={[styles.tableCol, styles.amountCol]}>
                  <Text>{item.taxable_value.toFixed(2)}</Text>
                </View>
              </View>
            ))}
          </View>
          {/* Details Container */}
          <View style={styles.detailsContainer}>
            {/* Bank Details - Left Side */}
            <View style={styles.bankDetailsContainer}>
              <Text style={styles.bankTitle}>BANK DETAILS:</Text>
              <Text style={styles.bankInfo}>
                Name: {companyProfile.bankName}
              </Text>
              <Text style={styles.bankInfo}>
                Branch: {companyProfile.bankBranch}
              </Text>
              <Text style={styles.bankInfo}>
                A/c No.: {companyProfile.bankAccountNo}
              </Text>
              <Text style={styles.bankInfo}>
                IFSC Code: {companyProfile.bankIfscCode}
              </Text>
            </View>

            {/* Totals Section - Right Side */}
            <View style={styles.totalsContainer}>
              {(() => {
                const subtotal =
                  (invoice.total_amount_before_tax || 0) -
                  (invoice.packing_cartage_charges || 0);
                const packingCharges = invoice.packing_cartage_charges || 0;
                const taxableAmount = invoice.total_amount_before_tax || 0; // This already includes packing charges if applicable

                return (
                  <>
                    <View style={styles.totalsRow}>
                      <Text style={styles.totalsLabel}>Subtotal</Text>
                      <Text style={styles.totalsValue}>
                        {"₹"} {subtotal.toFixed(2)}
                      </Text>
                    </View>

                    {packingCharges > 0 && (
                      <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>Packing/Cartage</Text>
                        <Text style={styles.totalsValue}>
                          {"₹"} {packingCharges.toFixed(2)}
                        </Text>
                      </View>
                    )}

                    <View style={styles.totalsRow}>
                      <Text style={styles.totalsLabel}>Taxable Amount</Text>
                      <Text style={styles.totalsValue}>
                        {"₹"} {taxableAmount.toFixed(2)}
                      </Text>
                    </View>

                    {invoice.tax_type === "CGST_SGST" ? (
                      <>
                        <View style={styles.totalsRow}>
                          <Text style={styles.totalsLabel}>
                            CGST @{invoice.cgst_rate}%
                          </Text>
                          <Text style={styles.totalsValue}>
                            {"₹"} {invoice.cgst_amount?.toFixed(2) || "0.00"}
                          </Text>
                        </View>
                        <View style={styles.totalsRow}>
                          <Text style={styles.totalsLabel}>
                            SGST @{invoice.sgst_rate}%
                          </Text>
                          <Text style={styles.totalsValue}>
                            {"₹"} {invoice.sgst_amount?.toFixed(2) || "0.00"}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.totalsRow}>
                        <Text style={styles.totalsLabel}>
                          IGST @{invoice.igst_rate}%
                        </Text>
                        <Text style={styles.totalsValue}>
                          {"₹"} {invoice.igst_amount?.toFixed(2) || "0.00"}
                        </Text>
                      </View>
                    )}

                    <View style={styles.totalAmountRow}>
                      <Text style={styles.totalAmountText}>Grand Total</Text>
                      <Text style={styles.totalAmountText}>
                        {"₹"}{" "}
                        {Math.round(
                          invoice.total_amount_after_tax || 0
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </>
                );
              })()}

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 3,
                }}
              ></View>
            </View>
          </View>
          <View style={{ marginTop: 1, marginBottom: 3, paddingTop: 2 }}>
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              Amount in Words: {invoice.total_amount_in_words}
            </Text>
          </View>
          {/* Terms and Conditions */}
          <View
            style={{
              marginVertical: 5,
              borderTop: "1pt solid #CCCCCC",
              paddingTop: 5,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "bold", marginBottom: 3 }}>
              TERMS AND CONDITIONS:
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>
              1. {companyProfile.termsCondition1}
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>
              2. {companyProfile.termsCondition2}
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>
              3. {companyProfile.termsCondition3}
            </Text>
            <Text style={{ fontSize: 9, marginBottom: 2 }}>
              4. {companyProfile.termsCondition4}
            </Text>
          </View>
        </View>
        {/* End of main content wrapper */}
        {/* Signature */}
        <View
          style={styles.signatureSection}
          wrap={false} // Prevent signature from splitting across pages
          // style={{
          //   flexDirection: "row",
          //   marginTop: 20,
          //   justifyContent: "space-between",
          // }}
        >
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                borderTop: "1pt solid #000000",
                width: 150,
                marginBottom: 3,
              }}
            />
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              Receiver Signature
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <View
              style={{
                borderTop: "1pt solid #000000",
                width: 150,
                marginBottom: 3,
              }}
            />
            <Text style={{ fontSize: 10, fontWeight: "bold" }}>
              Signatory – {companyProfile.companyName}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// PDF Download Link Component
interface PDFDownloadButtonProps {
  invoiceData: InvoiceWithRelations; // Use the combined type
  invoiceType?: "original" | "duplicate" | "triplicate";
  fileName?: string;
  className?: string;
}

export const PDFDownloadButton = ({
  invoiceData,
  invoiceType,
  fileName = `Invoice_${invoiceData.invoice_number}.pdf`,
  className,
}: PDFDownloadButtonProps) => (
  <Button variant="outline" size="sm" asChild className={cn(className)}>
    <PDFDownloadLink
      document={
        <InvoicePDFDocument
          invoiceData={invoiceData}
          invoiceType={invoiceType}
        />
      }
      fileName={fileName}
      // className is now handled by the wrapping Button
    >
      {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
    </PDFDownloadLink>
  </Button>
);

export default InvoicePDFDocument;
