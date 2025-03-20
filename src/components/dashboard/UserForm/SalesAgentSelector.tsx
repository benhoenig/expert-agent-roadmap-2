import React from 'react';
import { FormLabel } from "../../ui/form";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Checkbox } from "../../ui/checkbox";
import { Check, ChevronsUpDown } from "lucide-react";

interface SalesAgentSelectorProps {
  availableSales: { id: number; name: string }[];
  selectedSalesIds: number[];
  toggleSalesSelection: (salesId: number, salesName: string) => void;
  multiSelectOpen: boolean;
  setMultiSelectOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SalesAgentSelector: React.FC<SalesAgentSelectorProps> = ({
  availableSales,
  selectedSalesIds,
  toggleSalesSelection,
  multiSelectOpen,
  setMultiSelectOpen
}) => {
  return (
    <div className="space-y-2">
      <FormLabel htmlFor="sales-agents">Assigned Sales Agents</FormLabel>
      <Popover open={multiSelectOpen} onOpenChange={setMultiSelectOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={multiSelectOpen}
            className="w-full justify-between"
          >
            {selectedSalesIds.length > 0
              ? `${selectedSalesIds.length} sales agent${selectedSalesIds.length > 1 ? 's' : ''} selected`
              : "Select sales agents"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="p-2">
            <div className="relative">
              <Input
                placeholder="Search sales agents..."
                className="mb-2"
                onChange={(e) => {
                  // Simple search filter could be added here if needed
                }}
              />
            </div>
            <div className="max-h-64 overflow-auto">
              {availableSales && availableSales.length > 0 ? (
                availableSales.map((sales) => (
                  <div 
                    key={sales.id}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => toggleSalesSelection(sales.id, sales.name)}
                  >
                    <Checkbox
                      checked={selectedSalesIds.includes(sales.id)}
                      className="mr-2"
                    />
                    <span>{sales.name}</span>
                    {selectedSalesIds.includes(sales.id) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  No sales agents available
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <p className="text-xs text-muted-foreground mt-1">
        Select multiple sales agents to assign to this mentor. Changes will be applied when you click "Update User".
      </p>
    </div>
  );
}; 