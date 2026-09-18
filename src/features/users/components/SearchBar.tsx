import { useId, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function SearchBar({ value, onChange, onClear, disabled = false }: SearchBarProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleClear() {
    onClear();
    inputRef.current?.focus();
  }

  return (
    <div className="w-full sm:flex-1">
      <label htmlFor={inputId} className="sr-only">
        Search the directory
      </label>

      <div className="group relative flex items-center">
        <Search
          className="pointer-events-none absolute left-3.5 size-4 text-muted transition-colors group-focus-within:text-accent"
          aria-hidden="true"
        />

        <input
          id={inputId}
          ref={inputRef}
          type="search"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && value) {
              event.preventDefault();
              handleClear();
            }
          }}
          placeholder="Search by name..."
          autoComplete="off"
          spellCheck={false}
          className="h-8 w-full rounded-none border-0 bg-transparent pl-10 pr-10 text-base text-ink outline-none placeholder:text-muted/50 transition-colors focus:placeholder:text-muted/30 disabled:opacity-60 [&::-webkit-search-cancel-button]:appearance-none"
        />

        {value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 grid size-6 place-items-center rounded text-muted transition-colors hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
