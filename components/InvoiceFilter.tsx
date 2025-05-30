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
      className="flex flex-col sm:flex-row w-full max-w-md items-center space-y-2 sm:space-y-0 sm:space-x-2"
    >
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search by client, invoice no. or date"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 w-full pl-10"
        />
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
      <Button type="submit" size="sm" className="w-full sm:w-auto hidden sm:block">
        Search
      </Button>
    </form>
  );
}
