// TypeScript interfaces for database schema

// Client interface
export interface Client {
  id: string; // UUID
  name: string;
  address?: string;
  gstin?: string;
  phone?: string;
  state?: string;
  state_code?: string;
  created_at: string; // TIMESTAMPTZ
}

// Product interface
export interface Product {
  id: string; // UUID
  name: string;
  hsn_sac_code?: string;
  // default_rate?: number; // NUMERIC(10, 2) - Removed
  created_at: string; // TIMESTAMPTZ
}

// Invoice interface
export interface Invoice {
  id: string; // UUID
  invoice_number: string;
  invoice_date: string; // DATE
  transport_mode?: string;
  vehicle_number?: string;
  supply_date_time?: string; // TIMESTAMPTZ
  place_of_supply?: string;
  po_rgp_no?: string;
  order_date?: string; // DATE
  // billed_to_details: ClientDetails; - Removed
  // shipped_to_details: ClientDetails; - Removed
  billed_to_client_id: string | null; // UUID REFERENCES clients(id)
  shipped_to_client_id: string | null; // UUID REFERENCES clients(id)
  total_amount_before_tax?: number; // NUMERIC(12, 2)
  tax_type?: string; // 'IGST' or 'CGST_SGST'
  cgst_rate?: number; // NUMERIC(4, 2)
  cgst_amount?: number; // NUMERIC(10, 2)
  sgst_rate?: number; // NUMERIC(4, 2)
  sgst_amount?: number; // NUMERIC(10, 2)
  igst_rate?: number; // NUMERIC(4, 2)
  igst_amount?: number; // NUMERIC(10, 2)
  packing_cartage_charges?: number; // NUMERIC(10, 2)
  total_amount_after_tax?: number; // NUMERIC(12, 2)
  total_amount_in_words?: string;
  created_at: string; // TIMESTAMPTZ

  // Optional nested types for joined data
  billed_client?: Client | null;
  shipped_client?: Client | null;
}

// Invoice Item interface
export interface InvoiceItem {
  id: string; // UUID
  invoice_id: string; // UUID
  // item_name: string; - Removed
  // hsn_sac_code?: string; - Removed
  product_id: string; // UUID REFERENCES products(id)
  quantity: number; // NUMERIC(10, 2)
  rate: number; // NUMERIC(10, 2)
  taxable_value: number; // NUMERIC(12, 2)
  created_at: string; // TIMESTAMPTZ

  // Optional nested type for joined data
  products?: Product | null;
}

// Note: ClientDetails interface removed as it's no longer needed for JSONB columns
