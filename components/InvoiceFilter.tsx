"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface InvoiceFilterProps {
  onFilter: (query: string) => void;
}

export default function InvoiceFilter({ onFilter }: InvoiceFilterProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md items-center space-x-2"
    >
      <Input
        type="text"
        placeholder="Search by client name, invoice number or date"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 w-full"
      />
      <Button type="submit" size="sm">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
