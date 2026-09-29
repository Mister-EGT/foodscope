"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Image as ImageIcon, Maximize2, X } from "lucide-react";
import { ProductImage } from "@/components/product/product-image";
import type { Product } from "@/lib/openfoodfacts/types";

type GalleryItem = { label: string; url: string };

function LightboxItem({ item, name }: { item: GalleryItem; name: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
          aria-label={item.label + " vergrößern"}
        >
          <span className="relative block h-[112px] overflow-hidden rounded-lg border border-line bg-surface-muted transition-colors group-hover:border-forest/50 sm:h-[126px]">
            <ProductImage
              src={item.url}
              alt={name + " – " + item.label}
              sizes="(max-width: 640px) 38vw, 200px"
            />
            <span className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface/90 text-ink">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </span>
          <span className="mt-1.5 block text-center text-xs text-muted">{item.label}</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,920px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-3 shadow-soft focus:outline-none">
          <div className="mb-3 flex items-center justify-between gap-3 px-1">
            <Dialog.Title className="text-sm font-medium">{name} · {item.label}</Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-ink"
                aria-label="Bild schließen"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>
          <div className="relative h-[min(70vh,700px)] overflow-hidden rounded-lg bg-surface-muted">
            <ProductImage
              src={item.url}
              alt={name + " – " + item.label}
              sizes="92vw"
            />
          </div>
          <Dialog.Description className="sr-only">
            Vergrößerte Produktaufnahme. Mit Escape schließen.
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ProductGallery({ product }: { product: Product }) {
  const name = product.name ?? "Produkt";
  const items: GalleryItem[] = [
    product.imageUrl ? { label: "Vorderseite", url: product.imageUrl } : null,
    product.imageIngredientsUrl ? { label: "Zutaten", url: product.imageIngredientsUrl } : null,
    product.imageNutritionUrl ? { label: "Nährwerte", url: product.imageNutritionUrl } : null,
  ].filter((item): item is GalleryItem => item !== null);

  return (
    <section aria-labelledby="gallery-title" className="mt-6 border-t border-line pt-4">
      <h3 id="gallery-title" className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <ImageIcon className="h-4 w-4 text-forest" aria-hidden="true" />
        Produktbilder
      </h3>
      {items.length > 0 ? (
        <div className="flex gap-3">
          {items.map((item) => (
            <LightboxItem key={item.label} item={item} name={name} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-line px-4 py-5 text-sm text-muted">
          Für dieses Produkt sind keine Bilder vorhanden.
        </p>
      )}
    </section>
  );
}
