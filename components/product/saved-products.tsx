"use client";

import { AlertCircle, ArrowLeft, Heart, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/use-openfoodfacts";
import { useLocalStrings } from "@/hooks/use-local-strings";

export function SavedProducts({ kind }: { kind: "favorites" | "history" }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const isFavorites = kind === "favorites";
  const saved = useLocalStrings(
    isFavorites ? "foodscope:favorites" : "foodscope:history",
    isFavorites ? 100 : 20,
  );
  const visibleItems = saved.items.slice(0, visibleCount);
  const productQueries = useProducts(visibleItems);
  const products = productQueries
    .map((query) => query.data)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const title = isFavorites ? "Favoriten" : "Verlauf";
  const isLoading = productQueries.some((query) => query.isLoading);
  const hasUnavailable = productQueries.some((query) => query.isError);
  const retryUnavailable = () => {
    productQueries
      .filter((query) => query.isError)
      .forEach((query) => void query.refetch());
  };

  return (
    <div className="page-container pb-8 pt-9 sm:pt-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <h1 className="display-type text-[38px] font-semibold leading-tight tracking-[-0.05em]">{title}</h1>
            <p className="mt-2 text-sm text-muted">
              {isFavorites
                ? "Deine Favoriten bleiben auf diesem Gerät gespeichert."
                : "Die zuletzt geöffneten Produkte bleiben auf diesem Gerät gespeichert."}
            </p>
          </div>
          {saved.items.length > 0 && (
            <Button variant="outline" size="sm" onClick={saved.clear}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isFavorites ? "Favoriten leeren" : "Verlauf leeren"}
            </Button>
          )}
        </div>

        {!saved.ready ? (
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-40 rounded-xl" />)}
          </div>
        ) : saved.items.length === 0 ? (
          <div className="mt-7 flex flex-col items-center rounded-xl border border-line bg-surface-muted/50 px-6 py-14 text-center">
            {isFavorites ? (
              <Heart className="h-8 w-8 text-muted" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-8 w-8 text-muted" aria-hidden="true" />
            )}
            <h2 className="display-type mt-4 text-2xl font-semibold">
              {isFavorites ? "Noch keine Favoriten" : "Noch keine Produkte angesehen"}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {isFavorites
                ? "Speichere Produkte über das Herzsymbol, um sie hier wiederzufinden."
                : "Öffne ein Produkt, und es erscheint hier in deinem Verlauf."}
            </p>
            <Link href="/" className="quiet-link mt-5 inline-flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Zur Suche
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            {hasUnavailable && (
              <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <span className="inline-flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {products.length > 0
                    ? "Einige gespeicherte Produkte konnten nicht geladen werden."
                    : "Gespeicherte Produkte konnten nicht geladen werden."}
                </span>
                <Button variant="outline" size="sm" onClick={retryUnavailable}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Erneut versuchen
                </Button>
              </div>
            )}
            {products.length > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {products.map((product) => (
                  <ProductCard key={product.barcode} product={product} />
                ))}
              </div>
            )}
            {products.length === 0 && isLoading && (
              <div role="status" aria-label="Gespeicherte Produkte werden geladen" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-40 rounded-xl" />)}
              </div>
            )}
            {isLoading && products.length > 0 && (
              <p role="status" className="mt-4 text-sm text-muted">Weitere gespeicherte Produkte werden geladen …</p>
            )}
            {visibleItems.length < saved.items.length && (
              <div className="mt-5 flex justify-center">
                <Button variant="outline" onClick={() => setVisibleCount((count) => count + 12)}>
                  Weitere Produkte laden
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
