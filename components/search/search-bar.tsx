"use client";

import { Barcode, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useLocalStrings } from "@/hooks/use-local-strings";
import { cn } from "@/lib/utils";

export function SearchBar({
  defaultValue = "",
  large = false,
}: {
  defaultValue?: string;
  large?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [barcodeMode, setBarcodeMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const recentSearches = useLocalStrings("foodscope:searches", 8);
  const debouncedValue = useDebouncedValue(value);
  const suggestions = recentSearches.items.filter((item) =>
    debouncedValue.trim().length === 0
      ? true
      : item.toLocaleLowerCase("de").includes(debouncedValue.toLocaleLowerCase("de")),
  );

  const submitQuery = (queryValue: string) => {
    const query = queryValue.trim();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    recentSearches.add(query);
    setOpen(false);
    setActiveIndex(-1);
    if (/^\d{8,14}$/.test(query)) {
      router.push("/product/" + encodeURIComponent(query));
      return;
    }
    router.push("/search?q=" + encodeURIComponent(query));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuery(activeIndex >= 0 && suggestions[activeIndex] ? suggestions[activeIndex] : value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    }
  };

  const clear = () => {
    setValue("");
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <form
        onSubmit={handleSubmit}
        role="search"
        className={cn(
          "flex w-full items-center gap-2 rounded-xl border border-forest/65 bg-surface p-1.5 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(23,99,68,0.10)]",
          large ? "min-h-[72px]" : "min-h-[58px]",
        )}
      >
        <Search className="ml-3 h-5 w-5 shrink-0 text-ink" strokeWidth={1.8} aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setActiveIndex(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={(event) => {
            if (!event.currentTarget.parentElement?.parentElement?.contains(event.relatedTarget)) {
              window.setTimeout(() => setOpen(false), 120);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Produkte, Marken oder Barcodes suchen…"
          role="combobox"
          className={cn(
            "min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted/90",
            large ? "px-2 text-[16px]" : "px-1.5 text-sm",
          )}
          aria-label="Produkte, Marken oder Barcodes suchen"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? "search-option-" + activeIndex : undefined}
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={clear}
            aria-label="Sucheingabe löschen"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          className={cn("shrink-0 rounded-lg", large ? "h-12 w-12" : "h-10 w-10", barcodeMode && "border-forest text-forest")}
          onClick={() => {
            setBarcodeMode((mode) => !mode);
            inputRef.current?.focus();
          }}
          aria-label="Barcode direkt eingeben"
          aria-pressed={barcodeMode}
          title="Barcode direkt eingeben"
        >
          <Barcode className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button type="submit" size={large ? "lg" : "default"} className="shrink-0 px-5">
          <span>Suchen</span>
        </Button>
      </form>

      {open && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          role="listbox"
          aria-label="Zuletzt verwendete Suchbegriffe"
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-soft"
        >
          <div className="flex items-center justify-between px-3 pb-1 pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-muted">
              Zuletzt gesucht
            </p>
            <button
              type="button"
              className="text-[11px] font-medium text-muted transition-colors hover:text-forest"
              aria-label="Suchverlauf löschen"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                recentSearches.clear();
                setActiveIndex(-1);
              }}
            >
              Löschen
            </button>
          </div>
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <button
              key={suggestion}
              id={"search-option-" + index}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={cn(
                "flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-ink hover:bg-surface-muted",
                index === activeIndex && "bg-surface-muted",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => submitQuery(suggestion)}
            >
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <span className="truncate">{suggestion}</span>
            </button>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <Barcode className="h-4 w-4" aria-hidden="true" />
        <span>{barcodeMode ? "Barcode direkt im Suchfeld eingeben" : "Auch per Barcode suchen"}</span>
        {!barcodeMode && <span className="hidden text-muted/70 sm:inline">· z. B. 3017620422003</span>}
      </div>
    </div>
  );
}
