"use client";

import { AlertCircle, ArrowLeft, ArrowRight, PackageSearch, RefreshCw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { SearchBar } from "@/components/search/search-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductSearch } from "@/hooks/use-openfoodfacts";

function SearchResultsView() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const query = searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const search = useProductSearch(query, page);

  const navigatePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(pathname + "?" + params.toString());
  };

  return (
    <div className="page-container pb-8 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-8">
          <h1 className="display-type text-3xl font-semibold tracking-[-0.05em] sm:text-[38px]">
            {query ? "Suchergebnisse" : "Produkte suchen"}
          </h1>
          {query && <p className="mt-2 text-sm text-muted">Ergebnisse für „{query}“</p>}
          <div className="mt-5">
            <SearchBar key={query} defaultValue={query} />
          </div>
        </div>

        {!query ? (
          <div className="rounded-xl border border-line bg-surface-muted/50 px-6 py-10 text-center">
            <p className="text-sm text-muted">
              Gib einen Produktnamen, eine Marke oder einen Barcode ein, um die Suche zu starten.
            </p>
          </div>
        ) : search.isLoading ? (
          <>
            <div className="mb-4 h-4 w-36"><Skeleton className="h-4 w-36" /></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex gap-4 rounded-xl border border-line p-3">
                  <Skeleton className="h-[126px] w-[104px] shrink-0" />
                  <div className="flex flex-1 flex-col gap-3 py-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="mt-2 h-7 w-32" />
                    <Skeleton className="mt-auto h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : search.isError ? (
          <div role="alert" className="flex flex-col items-center rounded-xl border border-line bg-surface-muted/50 px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-forest" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">Die Suche ist gerade nicht verfügbar.</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              {search.error instanceof Error
                ? search.error.message
                : "Open Food Facts konnte die Anfrage nicht beantworten. Bitte prüfe deine Verbindung."}
            </p>
            <Button variant="outline" className="mt-5" onClick={() => search.refetch()}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Erneut versuchen
            </Button>
          </div>
        ) : search.data?.products.length ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3 text-sm text-muted">
              <p>
                {search.data.total !== null
                  ? new Intl.NumberFormat("de-DE").format(search.data.total) + " Produkte"
                  : "Produkte"}{" "}
                <span className="mx-1 text-line">·</span> Seite {page}
              </p>
              <span className="text-xs">Produktdaten können unvollständig sein.</span>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {search.data.products.map((product) => (
                <ProductCard key={product.barcode} product={product} />
              ))}
            </div>
            <nav aria-label="Suchergebnis-Seiten" className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePage(page - 1)}
                disabled={page <= 1}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Zurück
              </Button>
              <span className="min-w-16 text-center text-sm text-muted">Seite {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePage(page + 1)}
                disabled={!search.data.hasMore}
              >
                Weiter
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </nav>
          </>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-line bg-surface-muted/50 px-6 py-12 text-center">
            <PackageSearch className="h-8 w-8 text-muted" aria-hidden="true" />
            <h2 className="display-type mt-4 text-2xl font-semibold">Keine Produkte gefunden</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Prüfe die Schreibweise oder suche nach einer Marke. Du kannst auch den Barcode direkt eingeben.
            </p>
            <Link href="/" className="quiet-link mt-5 inline-flex items-center gap-1.5 text-sm font-medium">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Zur Startseite
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchFallback() {
  return (
    <div className="page-container py-10">
      <Skeleton className="mb-6 h-10 w-64" />
      <Skeleton className="mb-8 h-14 w-full" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-40 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResultsView />
    </Suspense>
  );
}
