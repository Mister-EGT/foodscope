import { SavedProducts } from "@/components/product/saved-products";

export const metadata = { title: "Verlauf" };

export default function HistoryPage() {
  return <SavedProducts kind="history" />;
}
