import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/lib/store";

export default function FilterBar() {
  const { activeFilter, searchQuery, setFilter, setSearchQuery } = useFilterStore();

  const filters = [
    { key: "all", label: "Tous", active: activeFilter === "all" },
    { key: "announcement", label: "Annonces", active: activeFilter === "announcement" },
    { key: "service", label: "Services", active: activeFilter === "service" },
    { key: "market", label: "Marketplace", active: activeFilter === "market" },
    { key: "poll", label: "Sondages", active: activeFilter === "poll" },
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.key}
              variant={filter.active ? "default" : "outline"}
              size="sm"
              className={`rounded-full ${
                filter.active 
                  ? "bg-primary text-white" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setFilter(filter.key)}
              data-testid={`filter-${filter.key}`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
        
        <div className="relative">
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64"
            data-testid="input-search"
          />
          <i className="fas fa-search absolute left-3 top-3 text-gray-400 text-sm"></i>
        </div>
      </div>
    </div>
  );
}
