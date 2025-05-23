import { useState, useEffect } from "react"; // Removed useCallback
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
// Removed debounce import as it's not used directly here
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Export the type
export interface AutocompleteOption {
  value: string;
  label: string;
  data?: any; // Full data object for the selected item
}

interface AutocompleteInputProps {
  id?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  onSelect?: (option: AutocompleteOption) => void;
  // Revert type to original expectation Promise<Array<...>>
  fetchSuggestions: (query: string) => Promise<AutocompleteOption[]>;
  disabled?: boolean;
  className?: string;
}

export default function AutocompleteInput({
  id,
  placeholder = "Search...",
  value = "",
  onChange,
  onSelect,
  fetchSuggestions, // This prop is already debounced by the parent hook
  disabled = false,
  className,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Update internal state when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Function to trigger the fetch (using the already debounced prop)
  const triggerFetchSuggestions = async (query: string) => {
      if (!query.trim()) {
          setOptions([]);
          setLoading(false);
          return;
      }
      setLoading(true);
      try {
          // Directly call the debounced function passed via props
          const results = await fetchSuggestions(query);
          setOptions(results);
      } catch (error) {
          console.error("Error fetching suggestions:", error);
          setOptions([]);
      } finally {
          setLoading(false);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    triggerFetchSuggestions(newValue); // Call the wrapper
  };

  const handleSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange(option.label);
    if (onSelect) {
      onSelect(option);
    }
    setOpen(false);
    setOptions([]); // Clear options after selection
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("flex w-full items-center", className)}>
          <Input
            id={id} // Apply the id prop
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onClick={() => {
                setOpen(true);
                // Optionally trigger fetch on click if input has value
                // if (inputValue.trim()) {
                //   triggerFetchSuggestions(inputValue);
                // }
            }}
            disabled={disabled}
            className="w-full"
          />
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-8 w-8 p-0"
            onClick={() => setOpen(!open)}
            disabled={disabled}
            type="button"
            aria-label="Toggle suggestions"
          >
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[--radix-popover-trigger-width]" align="start" sideOffset={5}>
        <Command shouldFilter={false}> {/* Disable default filtering */}
          <CommandInput
            placeholder={placeholder}
            value={inputValue} // Control CommandInput value
            onValueChange={(search) => {
              // Update state and trigger fetch on CommandInput change
              setInputValue(search);
              onChange(search);
              triggerFetchSuggestions(search);
            }}
          />
          <CommandList>
            {loading && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            )}
            {!loading && options.length === 0 && inputValue.trim() && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
             {!loading && options.length === 0 && !inputValue.trim() && (
              <CommandEmpty>Type to search...</CommandEmpty>
            )}
            {!loading && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label} // Use label for CommandItem value matching
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        // Check against label for visual feedback
                        inputValue === option.label ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
