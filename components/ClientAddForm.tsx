"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/database";

interface ClientAddFormProps {
  onSuccess?: (client: Client) => void;
  onCancel?: () => void;
}

export default function ClientAddForm({
  onSuccess,
  onCancel,
}: ClientAddFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    gstin: "",
    phone: "",
    state: "",
    state_code: "",
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
      setError("Client name is required");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from("clients")
        .insert([formData])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      if (data && onSuccess) {
        onSuccess(data as Client);
      }
    } catch (err: any) {
      console.error("Error adding client:", err);
      setError(err.message || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gstin">GSTIN</Label>
        <Input
          id="gstin"
          name="gstin"
          value={formData.gstin}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state_code">State Code</Label>
          <Input
            id="state_code"
            name="state_code"
            value={formData.state_code}
            onChange={handleChange}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Client"}
        </Button>
      </div>
    </form>
  );
}
