import type { Metadata } from "next";
import { ProductScreen } from "@/components/product/product-detail";
import { getProductFromOpenFoodFacts } from "@/lib/openfoodfacts/client";
import { cleanDisplayName } from "@/lib/openfoodfacts/helpers";

type ProductPageProps = {
  params: Promise<{ barcode: string }>;
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { barcode } = await params;
  if (!/^\d{8,14}$/.test(barcode)) {
    return { title: "Produkt nicht gefunden" };
  }

  try {
    const product = await getProductFromOpenFoodFacts(barcode);
    const name = cleanDisplayName(product.name, "Produkt");
    const brand = product.brands.join(", ");
    const title = brand ? name + " von " + brand : name;
    return {
      title: title + " – Produktinformationen",
      description:
        "Produktinformationen zu " + title + ": verfügbare Nährwerte, Zutaten und Bewertungen.",
      openGraph: { title: title + " | Foodscope" },
    };
  } catch {
    return {
      title: "Produkt " + barcode,
      description: "Produktinformationen aus Open Food Facts.",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { barcode } = await params;
  return <ProductScreen barcode={barcode} />;
}
