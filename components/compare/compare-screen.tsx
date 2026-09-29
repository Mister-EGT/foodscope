"use client";

import { AlertCircle, ArrowRight, Check, GitCompareArrows, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { ScoreMark } from "@/components/product/score-mark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts, useProductSearch } from "@/hooks/use-openfoodfacts";
import type { Product } from "@/lib/openfoodfacts/types";
import { formatNumber } from "@/lib/openfoodfacts/helpers";
import { updateCompareUrl } from "@/lib/utils";

function displayNutrient(value: number | null, unit = "g"): string {
  return value === null ? "Keine Angabe" : formatNumber(value) + " " + unit;
}

function CompareSearchResult({
  product,
  selected,
  atLimit,
  onAdd,
}: {
  product: Product;
  selected: boolean;
  atLimit: boolean;
  onAdd: (barcode: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-line bg-surface-muted">
        <ProductImage src={product.imageUrl} alt={product.name ?? "Produkt"} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{product.name ?? "Produkt ohne Namen"}</p>
        <p className="truncate text-xs text-muted">
          {product.brands.join(", ") || "Marke nicht angegeben"}
        </p>
      </div>
      <Button
        variant={selected ? "subtle" : "outline"}
        size="sm"
        onClick={() => onAdd(product.barcode)}
        disabled={selected || atLimit}
        aria-label={
          (product.name ?? "Produkt") +
          (selected ? " wurde zum Vergleich hinzugefügt" : " zum Vergleich hinzufügen")
        }
      >
        {selected ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {selected ? "Hinzugefügt" : "Hinzufügen"}
      </Button>
    </div>
  );
}

function ComparisonTable({
  products,
  onRemove,
}: {
  products: Product[];
  onRemove: (barcode: string) => void;
}) {
  const rows = [
    {
      label: "Nutri-Score",
      value: (product: Product) => product.scores.nutriScore?.toUpperCase() ?? "Keine Angabe",
    },
    {
      label: "NOVA",
      value: (product: Product) =>
        product.scores.novaGroup !== null ? String(product.scores.novaGroup) : "Keine Angabe",
    },
    {
      label: "Eco-Score",
      value: (product: Product) => product.scores.ecoScore?.toUpperCase() ?? "Keine Angabe",
    },
    { label: "Energie", value: (product: Product) => {
      const values = [
        product.nutrition.energyKj !== null ? formatNumber(product.nutrition.energyKj, 0) + " kJ" : null,
        product.nutrition.energyKcal !== null ? formatNumber(product.nutrition.energyKcal, 0) + " kcal" : null,
      ].filter(Boolean);
      return values.join(" · ") || "Keine Angabe";
    } },
    { label: "Fett", value: (product: Product) => displayNutrient(product.nutrition.fat) },
    { label: "Zucker", value: (product: Product) => displayNutrient(product.nutrition.sugars) },
    { label: "Kohlenhydrate", value: (product: Product) => displayNutrient(product.nutrition.carbohydrates) },
    { label: "Eiweiß", value: (product: Product) => displayNutrient(product.nutrition.proteins) },
    { label: "Salz", value: (product: Product) => displayNutrient(product.nutrition.salt) },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[780px] border-collapse text-sm">
        <caption className="sr-only">Produktvergleich: verfügbare Produktdaten nebeneinander</caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 w-[180px] border-b border-r border-line bg-surface px-4 py-4 text-left font-semibold">
              Produkt
            </th>
            {products.map((product) => (
              <th key={product.barcode} scope="col" className="min-w-[170px] border-b border-line px-3 py-4 text-center align-top font-normal">
                <div className="relative mx-auto h-[132px] w-[132px] overflow-hidden rounded-md bg-surface-muted">
                  <ProductImage src={product.imageUrl} alt={product.name ?? "Produkt"} sizes="132px" />
                </div>
                <Link href={"/product/" + encodeURIComponent(product.barcode)} className="mt-3 block text-sm font-semibold hover:text-forest">
                  {product.name ?? "Produkt ohne Namen"}
                </Link>
                <p className="mt-1 truncate text-xs font-normal text-muted">
                  {product.brands.join(", ") || "Marke nicht angegeben"}
                </p>
                <p className="mt-1 text-[11px] font-normal text-muted">{product.quantity ?? product.barcode}</p>
                <p className="mt-1 text-[11px] font-normal text-muted">Nährwerte pro {product.nutritionBasis}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8 rounded-full bg-surface/95"
                  aria-label={(product.name ?? "Produkt") + " aus dem Vergleich entfernen"}
                  onClick={() => onRemove(product.barcode)}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 3).map((row) => (
            <tr key={row.label} className="border-b border-line">
              <th scope="row" className="sticky left-0 z-10 border-r border-line bg-surface px-4 py-3 text-left font-medium">
                {row.label}
              </th>
              {products.map((product) => (
                <td key={product.barcode} className="px-3 py-3 text-center text-muted">
                  {row.label === "Nutri-Score" ? (
                    <ScoreMark type="nutri" value={product.scores.nutriScore} compact />
                  ) : row.label === "NOVA" ? (
                    <ScoreMark type="nova" value={product.scores.novaGroup} compact />
                  ) : row.label === "Eco-Score" ? (
                    <ScoreMark type="eco" value={product.scores.ecoScore} compact />
                  ) : (
                    row.value(product)
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-b border-line bg-surface-muted/65">
            <th
              scope="rowgroup"
              colSpan={products.length + 1}
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-muted"
            >
              Nährwerte
            </th>
          </tr>
          {rows.slice(3).map((row) => (
            <tr key={row.label} className="border-b border-line last:border-0">
              <th scope="row" className="sticky left-0 z-10 border-r border-line bg-surface px-4 py-3 text-left font-normal">
                {row.label}
              </th>
              {products.map((product) => (
                <td key={product.barcode} className="px-3 py-3 text-center text-muted">
                  {row.value(product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CompareScreen({ initialBarcodes }: { initialBarcodes: string[] }) {
  const [selected, setSelected] = useState(initialBarcodes.slice(0, 4));
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [notice, setNotice] = useState("");
  const search = useProductSearch(submittedQuery, 1, submittedQuery.length > 0);
  const productQueries = useProducts(selected);
  const products = productQueries
    .map((result) => result.data)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const busy = productQueries.some((result) => result.isLoading);
  const hasUnavailable = productQueries.some((result) => result.isError);

  const selectedKey = initialBarcodes.join(",");
  useEffect(() => {
    setSelected(selectedKey ? selectedKey.split(",").slice(0, 4) : []);
  }, [selectedKey]);

  const updateSelection = (next: string[]) => {
    const unique = Array.from(new Set(next)).slice(0, 4);
    setSelected(unique);
    window.history.replaceState(null, "", updateCompareUrl(unique));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  };

  const addProduct = (barcode: string) => {
    if (selected.includes(barcode)) return;
    if (selected.length >= 4) {
      setNotice("Es können höchstens vier Produkte verglichen werden.");
      return;
    }
    updateSelection([...selected, barcode]);
    setNotice("Produkt zum Vergleich hinzugefügt");
  };

  const removeProduct = (barcode: string) => {
    updateSelection(selected.filter((item) => item !== barcode));
  };

  const searchResults = search.data?.products ?? [];

  return (
    <div className="page-container pb-8 pt-9 sm:pt-12">
      <div className="mb-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display-type text-[38px] font-semibold leading-tight tracking-[-0.05em]">
              Produkte vergleichen
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Bis zu vier Produkte anhand der verfügbaren Daten nebeneinander ansehen.
            </p>
          </div>
          {selected.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setNotice("Vergleichslink kopiert");
                } catch {
                  setNotice("Der Vergleichslink konnte nicht kopiert werden.");
                }
              }}
            >
              Teilen
            </Button>
          )}
        </div>
      </div>

      <div className="relative mb-6 max-w-[970px]">
        <form onSubmit={submitSearch} role="search" className="flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 focus-within:border-forest/60">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
          <input
            type="search"
            className="min-w-0 flex-1 bg-transparent px-1 text-sm text-ink outline-none placeholder:text-muted"
            placeholder="Produkt hinzufügen"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Produkt zum Vergleich suchen"
          />
          {query && (
            <button type="button" aria-label="Suchbegriff löschen" onClick={() => { setQuery(""); setSubmittedQuery(""); }} className="rounded-full p-1.5 text-muted hover:bg-surface-muted">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <Button type="submit" size="icon" className="h-8 w-8 rounded-full" aria-label="Produkte suchen">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        {submittedQuery && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[360px] overflow-y-auto rounded-xl border border-line bg-surface shadow-soft">
            {search.isFetching ? (
              <div className="space-y-2 p-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : search.isError ? (
              <p role="alert" className="px-4 py-4 text-sm text-muted">Die Produktsuche ist gerade nicht verfügbar.</p>
            ) : searchResults.length ? (
              searchResults.map((product) => (
                <CompareSearchResult
                  key={product.barcode}
                  product={product}
                  selected={selected.includes(product.barcode)}
                  atLimit={selected.length >= 4}
                  onAdd={addProduct}
                />
              ))
            ) : (
              <p className="px-4 py-4 text-sm text-muted">Keine passenden Produkte gefunden.</p>
            )}
          </div>
        )}
      </div>

      {selected.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-line bg-surface-muted/50 px-6 py-14 text-center">
          <GitCompareArrows className="h-8 w-8 text-muted" aria-hidden="true" />
          <h2 className="display-type mt-4 text-2xl font-semibold">Füge Produkte zum Vergleich hinzu</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted">
            Suche nach einem Produkt und füge es hinzu. Du kannst bis zu vier Produkte in der Tabelle ansehen.
          </p>
          <Link href="/" className="quiet-link mt-5 inline-flex items-center gap-2 text-sm font-medium">
            Produkt suchen
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : busy ? (
        <div className="overflow-hidden rounded-xl border border-line p-4">
          <Skeleton className="mb-4 h-36 w-full" />
          {[0, 1, 2, 3, 4, 5].map((item) => <Skeleton key={item} className="mb-2 h-10 w-full" />)}
        </div>
      ) : (
        <>
          {products.length > 0 && <ComparisonTable products={products} onRemove={removeProduct} />}
          {hasUnavailable && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              Ein Produkt konnte nicht geladen werden. Du kannst es aus dem Vergleich entfernen.
            </div>
          )}
          <p className="mt-4 text-xs leading-5 text-muted">
            Die Nährwerte folgen der jeweiligen Produktbasis, die oben pro Produkt angegeben ist. Die Tabelle bewertet oder sortiert Produkte nicht.
          </p>
          {selected.length < 4 && (
            <p className="mt-3 text-xs text-muted">{4 - selected.length} weitere Produkte können hinzugefügt werden.</p>
          )}
        </>
      )}

      <span role="status" aria-live="polite" className="sr-only">{notice}</span>
    </div>
  );
}
