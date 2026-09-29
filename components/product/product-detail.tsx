"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  GitCompareArrows,
  Heart,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductImage } from "@/components/product/product-image";
import { NutritionTable } from "@/components/product/nutrition-table";
import { ScoreMark } from "@/components/product/score-mark";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-openfoodfacts";
import { useLocalStrings } from "@/hooks/use-local-strings";
import { cleanDisplayName } from "@/lib/openfoodfacts/helpers";
import type { Product } from "@/lib/openfoodfacts/types";
import { updateCompareUrl } from "@/lib/utils";
import { ClientApiError } from "@/hooks/use-openfoodfacts";

function ProductActions({ product }: { product: Product }) {
  const router = useRouter();
  const favorites = useLocalStrings("foodscope:favorites", 100);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const copyBarcode = async () => {
    try {
      await navigator.clipboard.writeText(product.barcode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("Barcode markieren und kopieren: " + product.barcode);
    }
  };

  const shareProduct = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name ?? "Produkt", url });
        setMessage("Produkt geteilt");
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Produktlink kopiert");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setMessage("Der Produktlink konnte nicht kopiert werden.");
      }
    }
  };

  const favorite = favorites.has(product.barcode);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        onClick={() => favorites.toggle(product.barcode)}
        aria-pressed={favorite}
      >
        <Heart
          className={"h-4 w-4 " + (favorite ? "fill-rose-500 text-rose-500" : "")}
          aria-hidden="true"
        />
        {favorite ? "Gespeichert" : "Favorit speichern"}
      </Button>
      <Button variant="outline" onClick={shareProduct}>
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Teilen
      </Button>
      <Button variant="outline" onClick={copyBarcode}>
        {copied ? (
          <Check className="h-4 w-4 text-forest" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        Barcode kopieren
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push(updateCompareUrl([product.barcode]))}
      >
        <GitCompareArrows className="h-4 w-4" aria-hidden="true" />
        Vergleichen
      </Button>
      <span role="status" aria-live="polite" className="sr-only">
        {message || (copied ? "Barcode kopiert" : "")}
      </span>
    </div>
  );
}

function ScoreCards({ product }: { product: Product }) {
  const descriptions = [
    {
      label: "Nutri-Score",
      value: product.scores.nutriScore,
      type: "nutri" as const,
      description: "Bewertet die Nährwertzusammensetzung eines Lebensmittels von A bis E.",
    },
    {
      label: "NOVA",
      value: product.scores.novaGroup,
      type: "nova" as const,
      description: "Ordnet Lebensmittel nach ihrem Verarbeitungsgrad in vier Gruppen ein.",
    },
    {
      label: "Eco-Score",
      value: product.scores.ecoScore,
      type: "eco" as const,
      description: "Zeigt die verfügbare Bewertung der Umweltauswirkungen.",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {descriptions.map((score) => (
        <div key={score.label} className="rounded-xl border border-line bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <ScoreMark type={score.type} value={score.value} />
              <p className="mt-2 text-xs leading-5 text-muted">{score.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function IngredientsSection({ product }: { product: Product }) {
  const foodLabels = [
    product.analysis.vegan ? "Vegan gekennzeichnet" : null,
    !product.analysis.vegan && product.analysis.vegetarian ? "Vegetarisch gekennzeichnet" : null,
  ].filter((value): value is string => value !== null);

  return (
    <section aria-labelledby="ingredients-title">
      <h2 id="ingredients-title" className="display-type mb-4 text-[23px] font-semibold tracking-[-0.04em]">
        Zutaten und Allergene
      </h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold">Zutaten</h3>
          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-muted">
            {product.ingredientsText ?? "Keine Zutatenangaben vorhanden."}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Allergene</h3>
          {product.allergens.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {product.allergens.map((allergen) => (
                <span
                  key={allergen}
                  className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                >
                  {allergen}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted">Keine Allergenangaben vorhanden.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {foodLabels.map((label) => (
            <span key={label} className="rounded-md bg-forest-soft px-2.5 py-1 text-xs font-medium text-forest">
              {label}
            </span>
          ))}
          <span className="rounded-md border border-line px-2.5 py-1 text-xs text-muted">
            {product.analysis.palmOil === "contains"
              ? "Palmölhinweis vorhanden"
              : product.analysis.palmOil === "free"
                ? "Als palmölfrei gekennzeichnet"
                : "Palmöl: Keine Angabe"}
          </span>
        </div>
      </div>
      <ProductGallery product={product} />
    </section>
  );
}

function ProductError({
  message,
  notFound,
  onRetry,
}: {
  message: string;
  notFound: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="page-container py-14">
      <div role="alert" className="mx-auto flex max-w-xl flex-col items-center rounded-xl border border-line bg-surface-muted/50 px-6 py-12 text-center">
        <AlertCircle className="h-9 w-9 text-forest" aria-hidden="true" />
        <h1 className="display-type mt-4 text-2xl font-semibold">
          {notFound ? "Produkt nicht gefunden" : "Produktdaten nicht verfügbar"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">{message}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {!notFound && (
            <Button variant="outline" onClick={onRetry}>
              Erneut laden
            </Button>
          )}
          <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-forest hover:bg-forest-soft">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Zur Suche
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductLoading() {
  return (
    <div className="page-container py-7 sm:py-9">
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.75fr]">
        <Skeleton className="h-[310px] rounded-xl sm:h-[390px]" />
        <div className="space-y-4">
          <Skeleton className="h-11 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-11 w-52" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}
          </div>
        </div>
      </div>
      <div className="mt-9 grid gap-8 border-t border-line pt-6 lg:grid-cols-2">
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

export function ProductScreen({ barcode }: { barcode: string }) {
  const query = useProduct(barcode);
  const { add: addToHistory } = useLocalStrings("foodscope:history", 20);
  const product = query.data;

  useEffect(() => {
    if (product) addToHistory(product.barcode);
  }, [product, addToHistory]);

  const name = cleanDisplayName(product?.name ?? null, "Produkt ohne Namen");

  if (query.isLoading) return <ProductLoading />;
  if (query.isError || !product) {
    const error = query.error;
    const notFound = error instanceof ClientApiError && (error.status === 404 || error.status === 400);
    return (
      <ProductError
        notFound={notFound}
        message={
          error instanceof Error
            ? error.message
            : "Open Food Facts konnte für diesen Barcode keine Daten laden."
        }
        onRetry={() => query.refetch()}
      />
    );
  }

  const brand = product.brands.join(", ") || "Marke nicht angegeben";
  const dataTags = [...product.categories, ...product.labels].slice(0, 8);

  return (
    <div className="page-container pb-4 pt-6 sm:pt-8">
      <nav aria-label="Brotkrumennavigation" className="mb-5 flex items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-forest">Suchen</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Produkt</span>
      </nav>

      <section className="grid gap-6 lg:grid-cols-[0.78fr_1.75fr] lg:gap-8">
        <div className="relative h-[300px] overflow-hidden rounded-xl border border-line bg-surface-muted sm:h-[390px]">
          <ProductImage
            src={product.imageUrl}
            alt={name}
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h1 className="display-type text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.08] tracking-[-0.055em]">
                {name}
              </h1>
              <p className="mt-2 text-lg text-muted">{brand}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
                {product.quantity && <span className="font-medium text-ink">{product.quantity}</span>}
                <span className="hidden h-4 border-l border-line sm:block" aria-hidden="true" />
                <span>Barcode: <span className="select-all">{product.barcode}</span></span>
                {product.quantity && <span className="hidden h-4 border-l border-line sm:block" aria-hidden="true" />}
                <span>Nährwerte pro {product.nutritionBasis}</span>
              </div>
              {dataTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {dataTags.map((tag) => (
                    <span key={tag} className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {product.countries.length > 0 && (
                <p className="mt-3 text-sm text-muted">
                  Verkaufsland: {product.countries.join(", ")}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <ProductActions product={product} />
            </div>
          </div>

          <div className="mt-6">
            <ScoreCards product={product} />
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 border-t border-line pt-6 lg:grid-cols-2 lg:gap-7">
        <section aria-labelledby="nutrition-title">
          <h2 id="nutrition-title" className="display-type mb-4 text-[23px] font-semibold tracking-[-0.04em]">
            Nährwerte pro {product.nutritionBasis}
          </h2>
          <NutritionTable product={product} />
          <p className="mt-3 text-xs leading-5 text-muted">
            Fehlende Werte werden als „Keine Angabe“ angezeigt. Die Daten stammen aus der Open-Food-Facts-Datenbank.
          </p>
        </section>

        <div className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
          <IngredientsSection product={product} />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <Link href="/" className="quiet-link inline-flex items-center gap-2 text-sm font-medium">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zurück zur Suche
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={"https://world.openfoodfacts.org/product/" + encodeURIComponent(product.barcode)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-muted hover:bg-surface-muted hover:text-ink"
          >
            Open Food Facts
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  );
}
