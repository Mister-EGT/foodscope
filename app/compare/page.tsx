import type { Metadata } from "next";
import { CompareScreen } from "@/components/compare/compare-screen";

export const metadata: Metadata = { title: "Produkte vergleichen" };

type ComparePageProps = {
  searchParams: Promise<{ products?: string | string[] }>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const raw = Array.isArray(params.products) ? params.products[0] : params.products ?? "";
  const barcodes = Array.from(
    new Set(raw.split(",").filter((barcode) => /^\d{8,14}$/.test(barcode))),
  ).slice(0, 4);
  return <CompareScreen key={barcodes.join(",")} initialBarcodes={barcodes} />;
}
