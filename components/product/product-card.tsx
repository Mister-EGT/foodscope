"use client";

import { ArrowUpRight, GitCompareArrows, Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductImage } from "@/components/product/product-image";
import { ScoreMark } from "@/components/product/score-mark";
import { Button } from "@/components/ui/button";
import { useLocalStrings } from "@/hooks/use-local-strings";
import type { Product } from "@/lib/openfoodfacts/types";
import { cleanDisplayName, formatNumber } from "@/lib/openfoodfacts/helpers";

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const router = useRouter();
  const favorites = useLocalStrings("foodscope:favorites", 100);
  const [notice, setNotice] = useState("");
  const name = cleanDisplayName(product.name, "Produkt ohne Namen");
  const brand = product.brands.join(", ") || "Marke nicht angegeben";
  const hasNutrients = product.nutrition.energyKcal !== null || product.nutrition.sugars !== null;
  const nutrients = hasNutrients
    ? [
        product.nutrition.energyKcal !== null
          ? formatNumber(product.nutrition.energyKcal, 0) + " kcal"
          : null,
        product.nutrition.sugars !== null
          ? formatNumber(product.nutrition.sugars) + " g Zucker"
          : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "Nährwerte nicht angegeben";

  const toggleFavorite = () => {
    const wasFavorite = favorites.has(product.barcode);
    favorites.toggle(product.barcode);
    setNotice(wasFavorite ? "Aus Favoriten entfernt" : "Zu Favoriten hinzugefügt");
  };

  const addToCompare = () => {
    const current = new URLSearchParams(window.location.search).get("products") ?? "";
    const selected = current.split(",").filter(Boolean);
    if (selected.includes(product.barcode)) {
      router.push("/compare?products=" + encodeURIComponent(selected.join(",")));
      return;
    }
    if (selected.length >= 4) {
      setNotice("Es können höchstens vier Produkte verglichen werden.");
      return;
    }
    const next = [...selected, product.barcode];
    router.push("/compare?products=" + encodeURIComponent(next.join(",")));
    setNotice("Produkt für den Vergleich ausgewählt");
  };

  return (
    <article className="group relative flex min-w-0 gap-4 rounded-xl border border-line bg-surface p-3 transition-colors hover:border-forest/45">
      <Link
        href={"/product/" + encodeURIComponent(product.barcode)}
        className="relative block h-[126px] w-[104px] shrink-0 overflow-hidden rounded-lg border border-line"
        aria-label={"Produktdetails öffnen: " + name}
      >
        <ProductImage src={product.imageUrl} alt={name} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={"/product/" + encodeURIComponent(product.barcode)}
              className="line-clamp-2 text-[15px] font-semibold leading-5 tracking-[-0.02em] hover:text-forest"
            >
              {name}
            </Link>
            <p className="mt-1 truncate text-sm text-muted">{brand}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={toggleFavorite}
            aria-label={favorites.has(product.barcode)
              ? name + " aus Favoriten entfernen"
              : name + " zu Favoriten hinzufügen"}
            title={favorites.has(product.barcode) ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          >
            <Heart
              className={"h-[18px] w-[18px] " + (favorites.has(product.barcode) ? "fill-rose-500 text-rose-500" : "")}
              aria-hidden="true"
            />
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ScoreMark type="nutri" value={product.scores.nutriScore} compact />
          <ScoreMark type="nova" value={product.scores.novaGroup} compact />
          {product.scores.ecoScore && <ScoreMark type="eco" value={product.scores.ecoScore} compact />}
          {product.quantity && <span className="text-xs text-muted">{product.quantity}</span>}
        </div>

        {!compact && (
          <>
            <p className="mt-2 line-clamp-1 text-xs text-muted">
              {product.categories[0] ?? "Kategorie nicht angegeben"}
            </p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">{nutrients}</p>
            <div className="mt-auto flex items-end justify-between gap-2 pt-2">
              <span className="truncate text-[11px] text-muted">Barcode {product.barcode}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 px-2 text-xs"
                onClick={addToCompare}
                aria-label={name + " zum Produktvergleich hinzufügen"}
              >
                <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
                Vergleichen
              </Button>
            </div>
          </>
        )}

        {compact && (
          <p className="mt-auto flex items-center gap-1 pt-2 text-xs font-medium text-forest">
            Details ansehen
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </p>
        )}
        <span role="status" aria-live="polite" className="sr-only">
          {notice}
        </span>
      </div>
    </article>
  );
}
