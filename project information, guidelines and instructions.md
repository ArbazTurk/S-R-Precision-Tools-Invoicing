Here is the detailed, step-by-step plan for building the S R Precision Tools invoicing website, provided entirely in English, based on the updated information and existing project setup.

Project: S R Precision Tools Invoicing - Invoice Generation Website (Phase 2 - Development)

1. Goal:
To build a secure, user-friendly web application where users of S R Precision Tools (with a predefined login) can easily create and manage invoices, manage client/product data (with suggestions and the ability to add new ones), and generate professional-looking PDF invoices. The website will be mobile-first and fully responsive.

2. Technology Stack:
(Confirmed based on your setup and previous discussion)

Frontend Framework: Next.js (v15 latest)

Language: TypeScript

UI Components: shadcn/ui

Styling: Tailwind CSS (latest)

Backend & Database: Supabase (already connected)

PDF Generation: @react-pdf/renderer (latest)

State Management (Optional): Zustand (can be useful for complex forms) or Next.js Context/Hooks.

Utility Library: number-to-words

3. Project Status & Next Steps:

Completed:
- Next.js project setup (using with-supabase template)
- Supabase environment variables (.env.local) configured
- Supabase Auth: Email provider enabled, Email confirmations disabled, Signup disabled
- Predefined user created in Supabase
- Database tables created via migrations
- Company profile configuration created <mcsymbol name="companyProfile" filename="companyProfile.ts" path="c:\Users\Arbaz Khan.LAPTOP-DHE2J88U\Desktop\test\s-r-precision-tools-invoicing\config\companyProfile.ts" startline="3" type="variable"></mcsymbol>
- Login page and route protection implemented <mcfile name="middleware.ts" path="c:\Users\Arbaz Khan.LAPTOP-DHE2J88U\Desktop\test\s-r-precision-tools-invoicing\utils\supabase\middleware.ts"></mcfile>
- Basic authentication flow with protected routes

Tasks Remaining:
~~- Configure hardcoded company profile data~~ ✅ COMPLETED
~~- Implement login page and route protection~~ ✅ COMPLETED
- Build Dashboard UI and functionality
- Implement Invoice Create/Edit Form UI and logic
- Create dialogs for adding new clients/products
- Implement invoice number generation logic
- Build PDF generation component
- Finalize tax calculation logic
- Add error handling and loading states

4. Data Management:

A. Hardcoded Company Profile (Frontend):

The company_profile table will not be created in the database.

Create a configuration file in your project, e.g., config/companyProfile.ts or lib/constants.ts.

Export all of S R Precision Tools' static information (name, address, GSTIN, bank details, terms, signature text) as an object from this file.

// config/companyProfile.ts
export const companyProfile = {
  companyName: "S. R. PRECISION TOOLS",
  addressLine1: "Khasra No. 1087, Block-C, Gali No. 2, Saddik Nagar",
  addressLine2: "Meerut Road, Ghaziabad - 201003",
  mobile: "9810789597, 9278016241, ...", // Add all relevant numbers
  email: "srprecisiontools17@gmail.com, ...", // Add all relevant emails
  gstin: "09ADJFS4409B1Z6",
  bankName: "PUNJAB NATIONAL BANK",
  bankBranch: "Meerut Road, Ghaziabad",
  bankAccountNo: "4021002100017934",
  bankIfscCode: "PUNB0402100",
  termsCondition1: "All disputes will be settled subject to Ghaziabad Jurisdiction.",
  termsCondition2: "Goods once sold can not be taken back.",
  termsCondition3: "Seller is not responsible for any loss, damage of goods in transit.",
  termsCondition4: "Interest @ 24% p.a. will be charged from the date of Invoice.",
  signaturePlaceholderText: "For S.R. PRECISION TOOLS",
  partnerSignatureText: "Partner",
  stateCode: "09" // Company's state code, crucial for tax calculation
};


Components needing this info (like Invoice Form header, PDF header/footer) will import data from this file.

B.i. Supabase Database Schema information (Created):

create the following tables:

clients table: (For suggestions and client management)

id (UUID, PK, Default: uuid_generate_v4())

name (TEXT, NOT NULL)

address (TEXT)

gstin (TEXT, UNIQUE) - GSTIN should be unique.

phone (TEXT)

state (TEXT)

state_code (TEXT) - State code (e.g., '09' for UP) important for tax determination.

created_at (TIMESTAMPTZ, Default: now())

products table: (For product suggestions)

id (UUID, PK, Default: uuid_generate_v4())

name (TEXT, NOT NULL, UNIQUE) - Product name should be unique.

hsn_sac_code (TEXT)

default_rate (NUMERIC(10, 2)) - Default price (can be overridden in invoice).

created_at (TIMESTAMPTZ, Default: now())

invoices table: (Main invoice data - user_id is less critical now but can be kept)

id (UUID, PK, Default: uuid_generate_v4())

invoice_number (TEXT, UNIQUE, NOT NULL) - e.g., "SRPT001", "SRPT002".

invoice_date (DATE, NOT NULL, Default: CURRENT_DATE)

reverse_charge (BOOLEAN, Default: false) - For YES/NO.

transport_mode (TEXT)

vehicle_number (TEXT)

supply_date_time (TIMESTAMPTZ)

place_of_supply (TEXT) - Name of the state (e.g., "GHAZIABAD")

po_rgp_no (TEXT) - Optional P.O./RGP number.

order_date (DATE) - Optional order date.

billed_to_details (JSONB) - Snapshot of client info (name, address, gstin, phone, state, state_code).

shipped_to_details (JSONB) - Snapshot of shipper info (name, address, gstin, phone, state, state_code).

total_amount_before_tax (NUMERIC(12, 2))

tax_type (TEXT) - 'IGST' or 'CGST_SGST'

cgst_rate (NUMERIC(4, 2), Default: 0) - Percentage if applicable.

cgst_amount (NUMERIC(10, 2), Default: 0)

sgst_rate (NUMERIC(4, 2), Default: 0) - Percentage if applicable.

sgst_amount (NUMERIC(10, 2), Default: 0)

igst_rate (NUMERIC(4, 2), Default: 0) - Percentage if applicable.

igst_amount (NUMERIC(10, 2), Default: 0)

packing_cartage_charges (NUMERIC(10, 2), Default: 0) - If applicable.

total_tax_amount (NUMERIC(10, 2))

total_amount_after_tax (NUMERIC(12, 2))

total_amount_in_words (TEXT)

// user_id (UUID, Foreign Key references auth.users(id)) - Optional: who created it.

created_at (TIMESTAMPTZ, Default: now())

Note: Store the full JSON snapshot of client details in billed_to_details and shipped_to_details so that changes in the clients table don't affect old invoices.

invoice_items table: (Line items for the invoice - unchanged)

id (UUID, PK, Default: uuid_generate_v4())

invoice_id (UUID, Foreign Key references invoices(id) ON DELETE CASCADE) - Link to invoice.

item_name (TEXT, NOT NULL) - Product/Service name (snapshot).

hsn_sac_code (TEXT) - (snapshot).

quantity (NUMERIC(10, 2), NOT NULL)

rate (NUMERIC(10, 2), NOT NULL) - (snapshot).

taxable_value (NUMERIC(12, 2), NOT NULL) - quantity * rate.

created_at (TIMESTAMPTZ, Default: now())

Note: Store item_name, hsn_sac_code, rate as snapshots here as well.

B.ii. Supabase Database Schema (Using Migrations) (i think ye bhi ho gaya h):
use database migrations for better version control and consistency.

Step 1 (Create Migration File):
Generate a new migration file.
Step 2 (Generate SQL):
refer to the table definitions provided in section 4.B.i. for the `clients`, `products`, `invoices`, and `invoice_items` tables.

Generate the complete SQL code (using standard PostgreSQL `CREATE TABLE` statements) required to create these four tables. Ensure all columns, data types (UUID, TEXT, JSONB, NUMERIC, DATE, TIMESTAMPTZ, BOOLEAN), primary keys (PK), foreign keys (FK with `ON DELETE CASCADE` for `invoice_items.invoice_id`), UNIQUE constraints (on `clients.gstin`, `products.name`, `invoices.invoice_number`), NOT NULL constraints, and default values (like `uuid_generate_v4()`, `now()`, `CURRENT_DATE`, `false`, 0) are correctly defined as specified in the plan document.

Step 3 (Populate Migration File):
Step 4 (Apply Migration):
Apply the migrations

C. Generate TypeScript Types(i think ye bhi ho gaya h) :
Now that the database tables have been created via migration, please generate the corresponding TypeScript interfaces (`Client`, `Product`, `Invoice`, `InvoiceItem`).

Create a new file at `types/database.ts` (or `lib/types.ts`).
The interfaces should reflect the columns and data types defined in the schema (Section 4.B.i.).
For JSONB columns (`billed_to_details`, `shipped_to_details`), define nested interfaces if appropriate (e.g., `ClientDetails`) or use a generic `Record<string, any>` or `Json` type (Supabase often provides a `Json` type). For database types like `TIMESTAMPTZ` or `DATE`, use `string` in the TypeScript interface, as that's how they are typically handled after fetching. Use `number` for `NUMERIC` types.
```    *(Alternative for C if Supabase types generation is preferred later: Instruct the AI on how to use `supabase gen types typescript --linked > types/database.ts` after the developer confirms CLI setup)*

5. Authentication Flow:

Login Page Implementation (app/login/page.tsx):

Create a simple page with shadcn/ui Input for email and password, and a "Login" Button.

On button click, call the signInWithPassword method from the Supabase client (obtained via createBrowserClient).

On success, redirect the user to /dashboard.

On error, notify the user via shadcn/ui Toast or simple text.

Logout Functionality:

Add a "Logout" button in a shared layout (app/layout.tsx or app/dashboard/layout.tsx) or a header component.

On click, call the Supabase signOut method and redirect the user to /login.

Protected Route Middleware (middleware.ts):

Create a middleware.ts file in the project root.

Use createMiddlewareClient from @supabase/auth-helpers-nextjs.

In the middleware function, check the user session (getSession).

If the user tries to access protected routes (like /dashboard, /create-invoice, /invoice/*) and there's no session, redirect them to /login.

If the user is on /login and has a session, redirect them to /dashboard.

6. Core Feature Implementation (Steps):

A. Dashboard (app/dashboard/page.tsx):

Fetch the latest 10 invoices from Supabase (SELECT * FROM invoices ORDER BY created_at DESC LIMIT 10). Do this in a Server Component or a Client Component (useEffect).

Display the invoice list using shadcn/ui Table (Columns: Invoice No., Date, Client Name, Total Amount).

Add "View/Edit" (Link to /invoice/[id]/edit) and "Download PDF" (PDFDownloadLink) buttons to each row.

Add an Input + Button for filtering by Client Name / Invoice Number. (Client-side filtering is okay initially; implement server-side filtering if data grows).

Add a "Create New Invoice" Button linking to /create-invoice.

B. Invoice Form (/create-invoice and /invoice/[id]/edit):

Main Form Component (components/InvoiceForm.tsx):

Use useState or useReducer (or Zustand store) for form state.

Header Display: Import data from config/companyProfile.ts and display it.

Invoice Metadata:

Invoice Number: Fetch from fetchNextInvoiceNumber function (see below), display only.

Invoice Date: DatePicker, default today.

Reverse Charge: Checkbox.

Transport Mode: Select ("By Road", "By Air", ...) + "Other" input.

Optional Fields: Relevant Input / DatePicker.

Client Information (Billed To / Shipped To):

Use the AutocompleteInput component (components/AutocompleteInput.tsx) for the Name field. The fetchSuggestions prop will query the Supabase clients table using .ilike('name', '%query%') (with debouncing). The onSelect callback will update the form state with the full client data.

Auto-update the tax type (tax_type state) based on the billed_to_details.state_code change (comparing against company state code '09').

"+" Add Client button: Opens a shadcn/ui Dialog containing components/ClientAddForm.tsx which saves the new client to the clients table.

Implement "Same as Billed To" Checkbox logic.

Item Lines:

Manage an array of items in the state. Render rows using map.

Each row has AutocompleteInput (for products), HSN, Qty, Rate Input, and a Delete Button.

"+" Add Product button: Opens Dialog + components/ProductAddForm.tsx.

Auto-calculate taxable_value (Qty * Rate).

Totals and Tax:

Auto-calculate the sum of all taxable_value (total_amount_before_tax).

Input for packing_cartage_charges.

Select tax_type (IGST/CGST_SGST) using RadioGroup (default based on state code).

Show editable Rate Input(s) based on selected tax type (default 18% or 9%+9%).

Auto-calculate Tax Amount(s), Total Tax, Total After Tax.

Generate total_amount_in_words using numberToWords.toWords(total_amount_after_tax).

Form Submission:

Validate the form data.

Use Supabase to insert or update data in invoices and invoice_items tables.

Show a Toast, redirect to /dashboard.

C. Autocomplete Component (components/AutocompleteInput.tsx):

Build using shadcn/ui Command or Popover + Input.

Props: fetchSuggestions (async function), onSelect (callback), placeholder, etc.

Implement debouncing in the fetchSuggestions call (e.g., using lodash.debounce or a custom hook) to avoid excessive API calls.

D. Invoice Number Generation (lib/invoiceUtils.ts or Supabase Edge Function):

Recommendation: Create a Supabase Edge Function.

The function fetches the highest invoice_number from the invoices table.

It parses the number, increments it, and formats it as 'SRPT' + 3 digits (with leading zeros) (e.g., SRPT${String(nextNum).padStart(3, '0')}).

It returns this new number.

Alternative (Less Safe): A client-side function that fetches the last number from Supabase and calculates. (Risk of race conditions).

Call this function when the Invoice Form loads.

7. PDF Generation (components/InvoicePDF.tsx and Download):

PDF Component (components/InvoicePDF.tsx):

Use @react-pdf/renderer.

Props: invoiceData (containing items, billed_to_details, etc.) and companyProfile (the hardcoded data).

Define styles using StyleSheet.create.

Follow the layout of the provided sample JPGs (Header, Client, Items Table, Totals, Bank, Terms, Signature).

PDF Download Link (PDFDownloadLink):

Place on the Dashboard/View page.

Pass <InvoicePDF invoiceData={...} companyProfile={companyProfile} /> to the document prop.

Set a dynamic fileName.

8. Additional Considerations:

Error Handling: Use try...catch blocks for all form submissions, Supabase calls, and PDF generation. Provide user feedback via Toast.

Loading States: Disable buttons and show loading indicators (e.g., lucide-react spinner) during data fetching or form submission.

Security (RLS): While it seems like a single-user (or single-login) application, setting up RLS policies (e.g., auth.uid() = user_id if you add user tracking) is good practice if multi-user access might ever be considered. The anon key is public, making RLS important if data needs segregation.

Performance: Debouncing in autocomplete is crucial. If the number of invoices or clients grows very large in the future, consider implementing pagination on the dashboard. Throttling could be used for rapid events (like scroll or resize), but debouncing is more relevant here.
