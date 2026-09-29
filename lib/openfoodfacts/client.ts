import { normalizeProduct, normalizeSearchResults } from "@/lib/openfoodfacts/helpers";
import { productResponseSchema, searchResponseSchema } from "@/lib/openfoodfacts/schemas";
import type { Product, SearchResults } from "@/lib/openfoodfacts/types";

const OFF_BASE_URL = "https://world.openfoodfacts.org";
const SEARCH_BASE_URL = "https://search.openfoodfacts.org";
const USER_AGENT = "Foodscope/1.0 (Open Food Facts product explorer)";

export const PRODUCT_FIELDS = [
  "code",
  "product_name",
  "product_name_de",
  "brands",
  "categories",
  "categories_tags",
  "quantity",
  "ingredients_text",
  "ingredients_text_de",
  "nutriments",
  "nutriscore_grade",
  "nutrition_grades",
  "nova_group",
  "environmental_score_grade",
  "ecoscore_grade",
  "image_front_url",
  "image_front_thumb_url",
  "image_ingredients_url",
  "image_nutrition_url",
  "allergens_tags",
  "labels_tags",
  "countries_tags",
  "nutrition_data_per",
  "ingredients_analysis_tags",
  "ingredients_from_palm_oil_tags",
  "ingredients_that_may_be_from_palm_oil_tags",
].join(",");

export const SEARCH_FIELDS = [
  "code",
  "product_name",
  "product_name_de",
  "brands",
  "quantity",
  "categories",
  "categories_tags",
  "nutrition_data_per",
  "nutriments",
  "nutriscore_grade",
  "nutrition_grades",
  "nova_group",
  "environmental_score_grade",
  "ecoscore_grade",
  "image_front_url",
  "image_url",
].join(",");

export class OpenFoodFactsError extends Error {
  status: number;
  code: "INVALID_BARCODE" | "NOT_FOUND" | "RATE_LIMIT" | "UNAVAILABLE";

  constructor(
    message: string,
    status: number,
    code: OpenFoodFactsError["code"],
  ) {
    super(message);
    this.name = "OpenFoodFactsError";
    this.status = status;
    this.code = code;
  }
}

function apiError(status: number): OpenFoodFactsError {
  if (status === 404) {
    return new OpenFoodFactsError("Produkt nicht gefunden.", 404, "NOT_FOUND");
  }
  if (status === 429) {
    return new OpenFoodFactsError(
      "Die Open Food Facts Suche ist gerade ausgelastet. Bitte versuche es später erneut.",
      429,
      "RATE_LIMIT",
    );
  }
  return new OpenFoodFactsError(
    "Open Food Facts ist gerade nicht erreichbar. Bitte versuche es erneut.",
    status >= 500 ? status : 502,
    "UNAVAILABLE",
  );
}

export async function getProductFromOpenFoodFacts(barcode: string): Promise<Product> {
  if (!/^\d{8,14}$/.test(barcode)) {
    throw new OpenFoodFactsError("Bitte gib einen gültigen Barcode mit 8 bis 14 Ziffern ein.", 400, "INVALID_BARCODE");
  }

  const url = new URL(
    OFF_BASE_URL + "/api/v3/product/" + encodeURIComponent(barcode) + ".json",
  );
  url.searchParams.set("fields", PRODUCT_FIELDS);
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) throw apiError(response.status);

  const json: unknown = await response.json();
  const parsed = productResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new OpenFoodFactsError(
      "Die Produktdaten konnten nicht gelesen werden.",
      502,
      "UNAVAILABLE",
    );
  }
  const status = parsed.data.status;
  const resultId = parsed.data.result?.id;
  if (
    status === 0 ||
    status === "failure" ||
    status === "error" ||
    resultId === "product_not_found" ||
    !parsed.data.product
  ) {
    throw apiError(404);
  }

  const product = normalizeProduct(parsed.data.product, barcode);
  if (!product) {
    throw new OpenFoodFactsError(
      "Für dieses Produkt liegen keine lesbaren Produktdaten vor.",
      502,
      "UNAVAILABLE",
    );
  }
  return product;
}

async function readSearchResponse(response: Response, page: number, pageSize: number): Promise<SearchResults> {
  if (!response.ok) throw apiError(response.status);
  const json: unknown = await response.json();
  const parsed = searchResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new OpenFoodFactsError("Die Suchergebnisse konnten nicht gelesen werden.", 502, "UNAVAILABLE");
  }
  return normalizeSearchResults(parsed.data, page, pageSize);
}

export async function searchOpenFoodFacts(
  query: string,
  page: number,
  pageSize = 12,
): Promise<SearchResults> {
  const requestBody = {
    q: query,
    page,
    page_size: pageSize,
    fields: SEARCH_FIELDS.split(","),
    langs: ["de", "en"],
    boost_phrase: true,
  };

  try {
    const response = await fetch(SEARCH_BASE_URL + "/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(12000),
    });
    if (response.ok) return readSearchResponse(response, page, pageSize);
    if (response.status === 429) throw apiError(429);
  } catch (error) {
    if (error instanceof OpenFoodFactsError && error.status === 429) throw error;
  }

  // Search-a-licious is the preferred full-text API. Keep the documented legacy
  // endpoint as a fallback in case the search service is temporarily unavailable.
  const legacyUrl = new URL(OFF_BASE_URL + "/cgi/search.pl");
  legacyUrl.searchParams.set("search_terms", query);
  legacyUrl.searchParams.set("search_simple", "1");
  legacyUrl.searchParams.set("action", "process");
  legacyUrl.searchParams.set("json", "1");
  legacyUrl.searchParams.set("page", String(page));
  legacyUrl.searchParams.set("page_size", String(pageSize));
  legacyUrl.searchParams.set("fields", SEARCH_FIELDS);
  const fallback = await fetch(legacyUrl, {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(12000),
  }).catch(() => null);

  if (!fallback) throw apiError(502);
  return readSearchResponse(fallback, page, pageSize);
}
