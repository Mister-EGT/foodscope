"use client";

import { ArrowRight, Clock3, Search as SearchIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";
import { SearchBar } from "@/components/search/search-bar";
import { useProducts } from "@/hooks/use-openfoodfacts";
import { useLocalStrings } from "@/hooks/use-local-strings";

const quickSearches = ["Olivenöl", "Haferdrink", "Schokolade"];

export default function HomePage() {
  const history = useLocalStrings("foodscope:history", 20);
  const recentProducts = useProducts(history.items.slice(0, 3));
  const readyProducts = recentProducts
    .map((query) => query.data)
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const loadingRecent = !history.ready || recentProducts.some((query) => query.isLoading);

  return (
    <div className="page-container">
      <section className="mx-auto flex max-w-[1320px] flex-col items-center pb-16 pt-20 text-center sm:pb-20 sm:pt-24">
        <h1 className="display-type w-full text-[clamp(2.45rem,5.4vw,5rem)] font-semibold leading-[1.02] tracking-[-0.06em]">
          Lebensmittel besser verstehen.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-[20px] sm:leading-8">
          Nährwerte, Zutaten und Herkunft in einem klaren Überblick.
        </p>
        <div className="mt-10 w-full max-w-[990px]">
          <SearchBar large />
        </div>
      </section>

      <section className="border-t border-line pb-2 pt-8 sm:pt-9" aria-labelledby="recent-title">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {history.items.length > 0 ? (
              <Clock3 className="h-5 w-5 text-forest" aria-hidden="true" />
            ) : (
              <Sparkles className="h-5 w-5 text-forest" aria-hidden="true" />
            )}
            <h2 id="recent-title" className="display-type text-[20px] font-semibold tracking-[-0.04em] sm:text-[23px]">
              Zuletzt angesehen
            </h2>
          </div>
          {history.items.length > 0 && (
            <Link href="/history" className="quiet-link inline-flex items-center gap-1.5 text-sm font-medium">
              Alle anzeigen
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>

        {loadingRecent && history.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Zuletzt angesehene Produkte werden geladen">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[152px] animate-pulse rounded-xl border border-line bg-surface-muted" />
            ))}
          </div>
        ) : readyProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {readyProducts.map((product) => (
              <ProductCard key={product.barcode} product={product} compact />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-5 rounded-xl border border-line bg-surface-muted/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-sm font-medium">Finde ein Produkt über Name, Marke oder Barcode.</p>
              <p className="mt-1 text-sm text-muted">Deine zuletzt angesehenen Produkte erscheinen hier.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((term) => (
                <Link
                  key={term}
                  href={"/search?q=" + encodeURIComponent(term)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-xs font-medium text-muted transition-colors hover:border-forest/50 hover:text-forest"
                >
                  <SearchIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-12 border-t border-line py-6">
        <p className="text-center text-xs text-muted">
          Produktdaten aus der offenen Datenbank von{" "}
          <a
            href="https://world.openfoodfacts.org/"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-forest underline-offset-4 hover:underline"
          >
            Open Food Facts
          </a>
        </p>
      </section>
    </div>
  );
}
