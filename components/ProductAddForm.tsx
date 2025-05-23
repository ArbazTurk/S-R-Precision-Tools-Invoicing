"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/database";

interface ProductAddFormProps {
  onSuccess?: (product: Product) => void;
  onCancel?: () => void;
}

export default function ProductAddForm({
  onSuccess,
  onCancel,
}: ProductAddFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    hsn_sac_code: "",
    // default_rate: "", // Removed
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name.trim()) {
      setError("Product name is required");
      setLoading(false);
      return;
    }

    // Remove default_rate conversion
    const productData = {
      name: formData.name,
      hsn_sac_code: formData.hsn_sac_code || null,
    };

    try {
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from("products")
        .insert([productData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data && onSuccess) {
        onSuccess(data as Product);
      }
    } catch (err: any) {
      console.error("Error adding product:", err);
      setError(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hsn_sac_code">HSN/SAC Code</Label>
        <Input
          id="hsn_sac_code"
          name="hsn_sac_code"
          value={formData.hsn_sac_code}
          onChange={handleChange}
        />
      </div>

      {/* Default Rate Input Removed */}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
