{selectedRole === 'Mentor' && (
  <div className="space-y-2">
    <Label htmlFor="sales-assignments">Assign Sales</Label>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedSalesCount > 0
            ? `${selectedSalesCount} sales selected`
            : "Select sales..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search sales..." />
          <CommandEmpty>No sales found.</CommandEmpty>
          <CommandGroup>
            {availableSales && availableSales.length > 0 ? (
              availableSales.map((sales) => (
                <CommandItem
                  key={sales.id}
                  value={sales.id.toString()}
                  onSelect={() => {
                    toggleSalesSelection(sales.id);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedSalesIds.includes(sales.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {sales.name || `Sales ${sales.id}`}
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No sales available</CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
    {selectedSalesIds.length > 0 && (
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-1">Selected Sales:</h4>
        <div className="flex flex-wrap gap-1">
          {selectedSalesIds.map((id) => {
            const sales = availableSales?.find((s) => s.id === id);
            return (
              <Badge key={id} variant="secondary" className="flex items-center gap-1">
                {sales ? (sales.name || `Sales ${id}`) : `Sales ${id}`}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleSalesSelection(id)}
                />
              </Badge>
            );
          })}
        </div>
      </div>
    )}
  </div>
)} 