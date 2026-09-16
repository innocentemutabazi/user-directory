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
    <div className="w-full">
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
          placeholder="Search by name, username, or email"
          autoComplete="off"
          spellCheck={false}
          className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-10 text-[15px] placeholder:text-muted/80 transition-colors hover:border-muted/50 focus:border-accent disabled:opacity-60 [&::-webkit-search-cancel-button]:appearance-none"
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
