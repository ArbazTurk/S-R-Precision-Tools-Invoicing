"use client";

import { useCallback } from "react";
import { createClient } from "../utils/supabase/client"; // Corrected import path
import { useToast } from "./use-toast"; // Corrected import path
import { Client, Product } from "../types/database"; // Corrected import path

/**
 * Provides memoized functions for fetching data needed by the invoice form,
 * such as client/product suggestions and the next invoice number.
 * @returns An object containing data fetching functions.
 */
export const useDataFetchers = () => {
  const supabase = createClient();
  const { toast } = useToast();

  // Fetch client suggestions for autocomplete
  const fetchClientSuggestions = useCallback(
    async (query: string): Promise<{ value: string; label: string; data: Client }[]> => {
      if (!query.trim()) return [];
      try {
        const { data, error } = await supabase
          .from("clients")
          .select("*")
          .ilike("name", `%${query}%`)
          .limit(10);
        if (error) throw error;
        return data?.map((client: Client) => ({
          value: client.id,
          label: client.name,
          data: client, // Include full client data
        })) || [];
      } catch (err: any) {
        console.error("Client Suggestion Error:", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch client suggestions." });
        return [];
      }
    },
    [supabase, toast] // Dependencies
  );

  // Fetch product suggestions for autocomplete
  const fetchProductSuggestions = useCallback(
    async (query: string): Promise<{ value: string; label: string; data: Product }[]> => {
      if (!query.trim()) return [];
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .ilike("name", `%${query}%`)
          .limit(10);
        if (error) throw error;
        return data?.map((product: Product) => ({
          value: product.id,
          label: product.name,
          data: product, // Include full product data
        })) || [];
      } catch (err: any) {
        console.error("Product Suggestion Error:", err);
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch product suggestions." });
        return [];
      }
    },
    [supabase, toast] // Dependencies
  );

  // Fetch the next sequential invoice number
  const fetchNextInvoiceNumber = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false }) // Order by creation time to get the latest
        .limit(1);
      if (error) throw error;

      let nextNum = 1;
      const prefix = "INV"; // Consider making prefix configurable if needed

      if (data && data.length > 0 && data[0].invoice_number) {
        // Extract numeric part, handle potential non-numeric prefixes robustly
        const lastNumStr = data[0].invoice_number.replace(/\D/g, ''); // Remove all non-digits
        const lastNum = parseInt(lastNumStr, 10);
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }
      // Format the next number with padding
      return `${prefix}${String(nextNum).padStart(4, "0")}`;
    } catch (err: any) {
      console.error("Error fetching next invoice number:", err);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch next invoice number." });
      return null; // Return null on error
    }
  }, [supabase, toast]); // Dependencies

  return { fetchClientSuggestions, fetchProductSuggestions, fetchNextInvoiceNumber };
};
