Goal: Normalize the database by modifying the existing tables ( invoices , invoice_items , products ) to use foreign key relationships with the clients and products tables, eliminating data duplication in invoices (for client details) and invoice_items (for product details). Define and implement the final, normalized database schema directly in the first migration file and update the application code accordingly.

Overall Strategy:

Schema Definition: Modify migrations/001_create_tables.sql to define the normalized clients, products, invoices, and invoice_items tables correctly from the start.
Apply Migration: Run the updated migration file against your empty Supabase database.(manually done by developer)
Type Definitions: Update/Regenerate types/database.ts based on the final schema.
Backend/Data Access Logic: Update all Supabase queries across app/, hooks/, lib/, and potentially components/ to use the correct foreign keys and joins.
Frontend Logic (Hooks/State): Refactor hooks/useInvoiceForm.ts for state management using IDs and handling related data.
UI Components (components/): Update all components involved in displaying or capturing client, product, or invoice data.
Utilities (lib/): Review utility functions for compatibility.
Configuration (config/): Likely unaffected.
Supabase Helpers (utils/supabase/): Unaffected.
Testing: Thoroughly test all features.

Detailed File-by-File Refactoring Plan:
Phase 1: Database Schema Definition

migrations/001_create_tables.sql
Action: Modify this file to define the final, normalized schema.

Changes:

Keep clients table definition as is.
Modify products table: Remove default_rate.
Modify invoices table: Remove billed_to_details and shipped_to_details (JSONB). Add billed_to_client_id UUID REFERENCES clients(id) and shipped_to_client_id UUID REFERENCES clients(id).
Modify invoice_items table: Remove item_name and hsn_sac_code. Add product_id UUID NOT NULL REFERENCES products(id). Ensure invoice_id reference remains.
Output Code:

001_create_tables.sql
Apply
-- Enable UUID extension if not already enabledCREATE EXTENSION IF NOT EXISTS "uuid-ossp";-- Create clients table (Seems correct as per original)CREATE TABLE IF NOT EXISTS clients (  id UUID PRIMARY KEY DEFAULT uuid_generate_v4  (),  name TEXT NOT NULL,  address TEXT,  gstin TEXT UNIQUE,  phone TEXT,  state TEXT,  state_code TEXT,  created_at TIMESTAMPTZ DEFAULT now());-- Create products table (Removed default_rate)CREATE TABLE IF NOT EXISTS products (  id UUID PRIMARY KEY DEFAULT uuid_generate_v4  (),  name TEXT NOT NULL UNIQUE,  hsn_sac_code TEXT,  -- default_rate NUMERIC(10, 2), -- Removed  created_at TIMESTAMPTZ DEFAULT now());-- Create invoices table (Replaced JSONB with Foreign Keys to clients)CREATE TABLE IF NOT EXISTS invoices (  id UUID PRIMARY KEY DEFAULT uuid_generate_v4  (),  invoice_number TEXT UNIQUE NOT NULL,  invoice_date DATE NOT NULL DEFAULT   CURRENT_DATE,  transport_mode TEXT,  vehicle_number TEXT,  supply_date_time TIMESTAMPTZ,  place_of_supply TEXT,  po_rgp_no TEXT,  order_date DATE,  -- billed_to_details JSONB, -- Removed  -- shipped_to_details JSONB, -- Removed  billed_to_client_id UUID REFERENCES clients  (id), -- Added FK  shipped_to_client_id UUID REFERENCES clients  (id), -- Added FK  total_amount_before_tax NUMERIC(12, 2),  tax_type TEXT,  cgst_rate NUMERIC(4, 2) DEFAULT 0,  cgst_amount NUMERIC(10, 2) DEFAULT 0,  sgst_rate NUMERIC(4, 2) DEFAULT 0,  sgst_amount NUMERIC(10, 2) DEFAULT 0,  igst_rate NUMERIC(4, 2) DEFAULT 0,  igst_amount NUMERIC(10, 2) DEFAULT 0,  packing_cartage_charges NUMERIC(10, 2)   DEFAULT 0,  total_tax_amount NUMERIC(10, 2),  total_amount_after_tax NUMERIC(12, 2),  total_amount_in_words TEXT,  created_at TIMESTAMPTZ DEFAULT now()  -- Consider adding ON DELETE constraints   for client FKs if needed (e.g., ON DELETE   SET NULL));-- Create invoice_items table (Replaced item details with Foreign Key to products)CREATE TABLE IF NOT EXISTS invoice_items (  id UUID PRIMARY KEY DEFAULT uuid_generate_v4  (),  invoice_id UUID NOT NULL REFERENCES invoices  (id) ON DELETE CASCADE,  -- item_name TEXT NOT NULL, -- Removed  -- hsn_sac_code TEXT, -- Removed  product_id UUID NOT NULL REFERENCES products  (id), -- Added FK  quantity NUMERIC(10, 2) NOT NULL,  rate NUMERIC(10, 2) NOT NULL, -- This is   the rate for THIS transaction  taxable_value NUMERIC(12, 2) NOT NULL,  created_at TIMESTAMPTZ DEFAULT now()  -- Consider adding ON DELETE RESTRICT for   product FK if needed);
Action: Apply this migration to your empty Supabase project.

Phase 2: Application Code Updates

types/database.ts
Action: Update TypeScript types to match the schema in the modified 001_create_tables.sql.
Changes:
Run supabase gen types typescript --local > "c:\Users\Arbaz Khan.LAPTOP-DHE2J88U\Desktop\experiment\s-r-precision-tools-invoicing-working-shadcn-for-database-refactoring\types\database.ts" or manually update.
Remove ClientDetails interface if no longer used elsewhere.
Update Product interface: Remove default_rate.
Update Invoice interface: Remove billed_to_details, shipped_to_details. Add billed_to_client_id: string | null, shipped_to_client_id: string | null. Add optional nested types for joins: billed_client?: Client | null, shipped_client?: Client | null.
Update InvoiceItem interface: Remove item_name, hsn_sac_code. Add product_id: string. Add optional nested type for joins: products?: Product | null.

hooks/useInvoiceForm.ts (useInvoiceForm)
Action: Major refactor of state, effects, and handlers.
Changes:
State: Replace formData.billed_to_details, formData.shipped_to_details with selectedBilledClientId: string | null, selectedShippedClientId: string | null. Update items state array: each item needs product_id: string | null instead of item_name, hsn_sac_code. Keep quantity, rate, taxable_value. Add state for fetched client/product data for display (e.g., billingClientData, shippingClientData, itemProductDataMap). Remove sameAsBilledTo state logic related to JSON comparison; replace with logic comparing selectedBilledClientId and selectedShippedClientId.
Initialization (useEffect for edit mode): Fetch invoice using joins (see previous plan for example query with aliases). Populate selectedBilledClientId, selectedShippedClientId, and map invoice_items to set product_id in the local items state. Store the fetched nested billed_client, shipped_client, and products data.
Initialization (useEffect for create mode): Ensure addItemRow initializes items with product_id: null.
Client/Product Selection: Update handlers (handleBillingClientSelect, handleShippingClientSelect, handleItemProductSelect) to receive the selected object (with id) from AutocompleteInput and update the corresponding ID state (selectedBilledClientId, selectedShippedClientId, or product_id within the specific item in the items array). Fetch/store full object data for display.
Saving (handleSubmit):
 Validation: Update validation logic to check for selectedBilledClientId instead of billed_to_details.name. Validate selected client GSTINs by fetching client data based on IDs if needed, or assume ClientAddForm handles validation. Validate items check for product_id instead of item_name.
 Payload Construction: Build invoiceDataToSave including billed_to_client_id: selectedBilledClientId, shipped_to_client_id: selectedShippedClientId. Build itemsToInsert mapping local items state to include product_id, quantity, rate, taxable_value, and invoice_id.
 Supabase Calls: Use the correctly structured payloads for insert or update operations. Ensure the update logic correctly handles replacing old items (delete old, insert new).

components/AutocompleteInput.tsx
Action: Adapt suggestion fetching and selection payload.
Changes: Fetch from clients or products tables. Ensure onSelect passes the full selected object (including id) back.
components/ClientAddForm.tsx & components/ProductAddForm.tsx

Action: Verify interaction with the final schema.
Changes: Ensure ProductAddForm does not try to save default_rate. Ensure callbacks (onClientAdded, onProductAdded) return the new object with its id.

components/invoice-form/InvoiceFormBilling.tsx & InvoiceFormShipping.tsx
Action: Update to use fetched client data based on IDs.
Changes: Receive billingClient: Client | null and shippingClient: Client | null as props. Display details from these objects. Use AutocompleteInput or buttons to trigger selection logic in useInvoiceForm. Implement "Same as Billing" logic by setting selectedShippedClientId = selectedBilledClientId.

components/invoice-form/InvoiceFormItems.tsx
Action: Update item row rendering and product selection.
Changes: Map over items state from useInvoiceForm. Each row component receives an item (with product_id, quantity, rate) and the corresponding fetched product: Product | null. Display product.name, product.hsn_sac_code. Use AutocompleteInput for product selection, updating the product_id in the parent hook's state.

components/InvoicePDF.tsx
Action: Adapt to the joined data structure.
Changes: Expect data like Invoice & { billed_client: Client | null; shipped_client: Client | null; invoice_items: (InvoiceItem & { products: Product | null })[] }. Access data using nested properties (e.g., invoiceData.billed_client?.name, item.products?.name).

app/dashboard/page.tsx & app/dashboard/client.tsx
Action: Update invoice list fetching.
Changes: Modify the select query in page.tsx to join with clients for the billing client's name: select('*, billed_client:clients!invoices_billed_to_client_id_fkey(name)). Update DashboardClient component to display invoice.billed_client?.name.

app/invoice/[id]/edit/page.tsx (page.tsx)
Action: Update single invoice fetching for the edit form.
Changes: Modify the select query to fetch the invoice with all necessary related data using joins: select('*, billed_client:clients!invoices_billed_to_client_id_fkey(*), shipped_client:clients!invoices_shipped_to_client_id_fkey(*), invoice_items(*, products(*))). Pass this comprehensive data structure to InvoiceForm.

lib/invoiceUtils.ts or lib/invoiceFormUtils.ts
Action: Review utility functions.
Changes:
calculateTotals: Ensure it correctly accesses item rate, quantity from the items array passed to it. It no longer needs direct access to item name/HSN within this function.
amountToWords, validateGSTIN, fetchNextInvoiceNumber (fetchNextInvoiceNumber): Likely unaffected by the schema normalization itself.

Other Files (app/actions.ts, app/auth/**, utils/supabase/**, config/**)
Action: Briefly review, but likely unaffected.
Changes: Auth actions (actions.ts), auth callback (route.ts), Supabase client/server/middleware utils (client.ts, server.ts, middleware.ts), and company config are not directly involved in handling the structure of invoice/client/product data and should not require changes for this refactor.
This plan focuses on setting up the correct normalized schema from the beginning in 001_create_tables.sql and then systematically updating the application code (types, data access, state management, UI) to work with this relational structure.