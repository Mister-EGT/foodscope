import { SavedProducts } from "@/components/product/saved-products";

export const metadata = { title: "Favoriten" };

export default function FavoritesPage() {
  return <SavedProducts kind="favorites" />;
}
