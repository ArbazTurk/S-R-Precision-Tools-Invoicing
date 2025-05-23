-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create clients table (Seems correct as per original)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  gstin TEXT,
  phone TEXT,
  state TEXT,
  state_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create products table (Removed default_rate)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  hsn_sac_code TEXT,
  -- default_rate NUMERIC(10, 2), -- Removed
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create invoices table (Replaced JSONB with Foreign Keys to clients)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transport_mode TEXT,
  vehicle_number TEXT,
  supply_date_time TIMESTAMPTZ,
  place_of_supply TEXT,
  po_rgp_no TEXT,
  order_date DATE,
  -- billed_to_details JSONB, -- Removed
  -- shipped_to_details JSONB, -- Removed
  billed_to_client_id UUID REFERENCES clients(id), -- Added FK
  shipped_to_client_id UUID REFERENCES clients(id), -- Added FK
  total_amount_before_tax NUMERIC(12, 2),
  tax_type TEXT,
  cgst_rate NUMERIC(4, 2) DEFAULT 0,
  cgst_amount NUMERIC(10, 2) DEFAULT 0,
  sgst_rate NUMERIC(4, 2) DEFAULT 0,
  sgst_amount NUMERIC(10, 2) DEFAULT 0,
  igst_rate NUMERIC(4, 2) DEFAULT 0,
  igst_amount NUMERIC(10, 2) DEFAULT 0,
  packing_cartage_charges NUMERIC(10, 2) DEFAULT 0,
  total_amount_after_tax NUMERIC(12, 2),
  total_amount_in_words TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
  -- Consider adding ON DELETE constraints for client FKs if needed (e.g., ON DELETE SET NULL)
);

-- Create invoice_items table (Replaced item details with Foreign Key to products)
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  -- item_name TEXT NOT NULL, -- Removed
  -- hsn_sac_code TEXT, -- Removed
  product_id UUID NOT NULL REFERENCES products(id), -- Added FK
  quantity NUMERIC(10, 2) NOT NULL,
  rate NUMERIC(10, 2) NOT NULL, -- This is the rate for THIS transaction
  taxable_value NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
  -- Consider adding ON DELETE RESTRICT for product FK if needed
);
