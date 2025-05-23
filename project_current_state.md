# Project Current State: S R Precision Tools - Invoicing Application (as of 2025-04-15)

## 1. Goal

To build a secure, user-friendly web application for S R Precision Tools (using a predefined login) to create/manage invoices, manage client/product data (with suggestions and add functionality), and generate PDF invoices.

## 2. Technology Stack

*   **Framework:** Next.js (v15.x - App Router)
*   **Language:** TypeScript
*   **UI Components:** shadcn/ui (Current)
*   **Styling:** Tailwind CSS (Current)
*   **Backend & Database:** Supabase (Connected via environment variables)
*   **Authentication:** Supabase Auth (Email/Password, SSR configured)
*   **PDF Generation:** @react-pdf/renderer (using Noto Sans font)
*   **State Management:** React Hooks (`useState`, `useEffect`, `useCallback`) within custom hooks (`useInvoiceForm`) and client components.
*   **Utility Libraries:** `number-to-words`, `clsx`, `tailwind-merge`

## 3. Project Structure & Key Files

*   **Entry Points:** `app/layout.tsx`, `app/page.tsx` (Login Page)
*   **Core Routes:**
    *   `/` (Login)
    *   `/dashboard` (Invoice List)
    *   `/create-invoice` (New Invoice Form)
    *   `/invoice/[id]/edit` (Edit Invoice Form)
*   **Authentication:**
    *   `middleware.ts` & `utils/supabase/middleware.ts` (Route protection)
    *   `app/actions.ts` (signInAction, signOutAction)
    *   `utils/supabase/client.ts` & `utils/supabase/server.ts` (Supabase client setup)
*   **Invoice Form:**
    *   `components/InvoiceForm.tsx` (Main container)
    *   `hooks/useInvoiceForm.ts` (Core logic, state, handlers)
    *   `components/invoice-form/*` (Sub-components: Metadata, Billing, Shipping, Items, Totals)
    *   `components/AutocompleteInput.tsx`
    *   `components/ClientAddForm.tsx`, `components/ProductAddForm.tsx` (Dialog forms)
*   **PDF:** `components/InvoicePDF.tsx`
*   **Database:**
    *   `types/database.ts` (TypeScript interfaces)
    *   `migrations/001_create_tables.sql` (Schema definition - `reverse_charge` removed)
*   **Configuration:** `config/companyProfile.ts` (Static company data)
*   **UI (Current):** `components/ui/*` (shadcn/ui components), `app/globals.css`, `tailwind.config.ts`, `postcss.config.js`

## 4. Current Functionality & State

*   **Authentication:** Login, logout, and route protection are implemented.
*   **Dashboard:** Displays a list of recent invoices, allows filtering (client-side), links to create/edit, and initiates PDF download.
*   **Invoice Form (Create/Edit):**
    *   Fetches next invoice number (client-side).
    *   Loads existing invoice data for editing.
    *   Handles input for metadata, client details (billing/shipping), items, taxes, etc.
    *   Includes autocomplete with debouncing for clients and products.
    *   Allows adding new clients/products via dialogs.
    *   Includes "Save this Client" functionality for newly typed clients in Billing/Shipping sections.
    *   Calculates totals and taxes automatically.
    *   Converts total amount to words.
    *   Performs basic validation on submit.
    *   Saves/Updates invoice and associated items to Supabase.
*   **PDF Generation:** Generates PDF using `@react-pdf/renderer` with Noto Sans font (including Rupee symbol). Download is triggered from the dashboard.
*   **Cleanup:** Removed significant unused code/files from the original starter template.
*   **Recent Changes:**
    *   Removed "Reverse Charge" functionality entirely.
    *   Added "Date and Time of Supply" field to the form and PDF.
    *   Switched PDF font from Roboto to Noto Sans to fix Rupee symbol rendering.
    *   Fixed various TypeScript errors, runtime errors (`searchParams`/`params`), and debounce logic issues.
    *   Added missing Toast component and integrated it.

## 5. Known Issues / Areas for Improvement (as of last interaction)

*   **PDF Download Button:** Functionality was questioned; logging was added to `fetchInvoiceItems` for diagnosis. Needs confirmation if working.
*   **Hydration Mismatch Warnings:** Observed on the dashboard, potentially due to browser extensions.
*   **Invoice Number Generation:** Currently client-side; could be moved to a (fixed) Supabase Edge Function for better concurrency handling.
*   **Slow Page Loads:** Create/Edit invoice pages reported as slow loading (needs investigation - could be data fetching, component complexity, etc.).
*   **Validation:** Could add more specific validation (e.g., GSTIN format) earlier in the process (e.g., in `ClientAddForm` or on input blur) in addition to the submit validation.
