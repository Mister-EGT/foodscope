export type Nutrition = {
  energyKcal: number | null;
  energyKj: number | null;
  fat: number | null;
  saturatedFat: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  fiber: number | null;
  proteins: number | null;
  salt: number | null;
};

export type Product = {
  barcode: string;
  name: string | null;
  brands: string[];
  quantity: string | null;
  categories: string[];
  labels: string[];
  countries: string[];
  imageUrl: string | null;
  imageIngredientsUrl: string | null;
  imageNutritionUrl: string | null;
  ingredientsText: string | null;
  allergens: string[];
  nutritionBasis: "100 g" | "100 ml";
  scores: {
    nutriScore: string | null;
    novaGroup: number | null;
    ecoScore: string | null;
  };
  nutrition: Nutrition;
  analysis: {
    vegan: boolean;
    vegetarian: boolean;
    palmOil: "contains" | "free" | "unknown";
  };
};

export type SearchResults = {
  products: Product[];
  page: number;
  pageSize: number;
  total: number | null;
  hasMore: boolean;
};

export type ApiErrorPayload = {
  error: string;
  code?: "INVALID_BARCODE" | "NOT_FOUND" | "RATE_LIMIT" | "UNAVAILABLE";
};
