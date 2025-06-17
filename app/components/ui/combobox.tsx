import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '~/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';

interface ComboboxProps<T> {
  items: T[]
  value: T | null
  onChange: (value: T | null) => void
  getOptionLabel: (option: T) => string
  placeholder?: string
  error?: boolean
  errorMessage?: string
}

export function Combobox<T>({
  items,
  value,
  onChange,
  getOptionLabel,
  placeholder = 'Select an option',
  error = false,
  errorMessage,
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            error && 'border-red-500',
          )}
        >
          {value ? getOptionLabel(value) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandEmpty>No option found.</CommandEmpty>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={getOptionLabel(item)}
                value={getOptionLabel(item)}
                onSelect={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    value && getOptionLabel(value) === getOptionLabel(item)
                      ? 'opacity-100'
                      : 'opacity-0',
                  )}
                />
                {getOptionLabel(item)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}