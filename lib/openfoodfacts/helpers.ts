import { rawProductSchema } from "@/lib/openfoodfacts/schemas";
import type { Product, SearchResults } from "@/lib/openfoodfacts/types";

type UnknownRecord = Record<string, unknown>;

const germanTaxonomyLabels: Record<string, string> = {
  breakfasts: "Frühstück",
  spreads: "Brotaufstriche",
  "sweet spreads": "süße Brotaufstriche",
  "confectionary based spreads": "Schokoaufstriche",
  vegetarian: "Vegetarisch",
  vegan: "Vegan",
  "no gluten": "Glutenfrei",
  milk: "Milch",
  nuts: "Schalenfrüchte",
  soybeans: "Soja",
  france: "Frankreich",
};

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function numberAt(record: UnknownRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = numberValue(record[key]);
    if (value !== null) return value;
  }
  return null;
}

function numberAtNormalizedBasis(record: UnknownRecord, keys: string[]): number | null {
  // Open Food Facts stores its normalized 100 g values under _100g; for liquids
  // those normalized values represent 100 ml. Keep _100ml as a legacy fallback.
  return numberAt(
    record,
    keys.flatMap((key) => [key + "_100g", key + "_100ml"]),
  );
}

function stringList(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  return values
    .map((entry) => stringValue(entry))
    .filter((entry): entry is string => entry !== null)
    .map(cleanTag)
    .filter((entry) => entry.length > 0);
}

function cleanTag(value: string): string {
  const withoutLanguage = value.includes(":") ? value.slice(value.indexOf(":") + 1) : value;
  const normalized = withoutLanguage
    .replaceAll("-", " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("de-DE");
  return germanTaxonomyLabels[normalized] ?? normalized.replace(/^\p{L}/u, (letter) => letter.toLocaleUpperCase("de-DE"));
}

function gradeValue(value: string | null): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return /^[a-e]$/.test(normalized) ? normalized : null;
}

function rawStringList(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return values
    .map((entry) => stringValue(entry))
    .filter((entry): entry is string => entry !== null);
}

function hasExactTaxonomyTag(value: unknown, expected: string): boolean {
  return rawStringList(value).some((tag) => {
    const id = tag.includes(":") ? tag.slice(tag.indexOf(":") + 1) : tag;
    return id.trim().toLowerCase() === expected;
  });
}

function firstString(record: UnknownRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = stringValue(record[key]);
    if (value) return value;
  }
  return null;
}

function normalizeImage(value: unknown): string | null {
  const image = stringValue(value);
  if (!image) return null;
  if (image.startsWith("https://")) return image;
  if (image.startsWith("http://")) return image.replace(/^http:/i, "https:");
  return null;
}

export function normalizeProduct(rawValue: unknown, barcodeHint?: string): Product | null {
  const parsed = rawProductSchema.safeParse(rawValue);
  if (!parsed.success) return null;

  const raw = parsed.data;
  const barcode =
    firstString(raw, ["code", "id", "_id"]) ??
    (typeof raw.code === "number" ? String(raw.code) : null) ??
    barcodeHint ??
    "";
  if (!barcode) return null;

  const nutriments = isRecord(raw.nutriments) ? raw.nutriments : {};
  const rawLabels = raw.labels_tags ?? raw.labels;
  const rawAnalysisTags = raw.ingredients_analysis_tags;
  const labelsRaw = stringList(rawLabels);
  const palmOilTags = [
    ...stringList(raw.ingredients_from_palm_oil_tags),
    ...stringList(raw.ingredients_that_may_be_from_palm_oil_tags),
  ];
  const vegan =
    hasExactTaxonomyTag(rawLabels, "vegan") ||
    hasExactTaxonomyTag(rawAnalysisTags, "vegan");
  const vegetarian =
    vegan ||
    hasExactTaxonomyTag(rawLabels, "vegetarian") ||
    hasExactTaxonomyTag(rawAnalysisTags, "vegetarian");
  const palmOil = palmOilTags.length > 0
    ? "contains"
    : hasExactTaxonomyTag(rawAnalysisTags, "palm-oil-free")
      ? "free"
      : "unknown";
  const reportedNutritionBasis =
    stringValue(raw.nutrition_data_per)?.toLocaleLowerCase("en") ?? "";
  const hasReportedMilliliterBasis = /100\s*ml\b/.test(reportedNutritionBasis);
  const hasReportedGramBasis = /100\s*g\b/.test(reportedNutritionBasis);
  const nutritionBasis = hasReportedMilliliterBasis
    ? "100 ml"
    : hasReportedGramBasis
      ? "100 g"
      : Object.keys(nutriments).some((key) => key.endsWith("_100ml"))
        ? "100 ml"
        : "100 g";

  const nutriScore = gradeValue(
    firstString(raw, ["nutriscore_grade", "nutrition_grades", "nutrition_grade_fr"]),
  );
  const ecoScore = gradeValue(firstString(raw, [
    "environmental_score_grade",
    "environmental_score",
    "ecoscore_grade",
    "ecoscore",
  ]));
  const novaValue = numberValue(raw.nova_group);

  return {
    barcode,
    name: firstString(raw, ["product_name_de", "product_name", "abbreviated_product_name"]),
    brands: stringList(raw.brands),
    quantity: stringValue(raw.quantity),
    categories: stringList(raw.categories_tags ?? raw.categories).slice(0, 4),
    labels: labelsRaw,
    countries: stringList(raw.countries_tags ?? raw.countries).slice(0, 4),
    imageUrl: normalizeImage(
      raw.image_front_url ?? raw.image_url ?? raw.image_front_thumb_url,
    ),
    imageIngredientsUrl: normalizeImage(raw.image_ingredients_url),
    imageNutritionUrl: normalizeImage(raw.image_nutrition_url),
    ingredientsText: firstString(raw, ["ingredients_text_de", "ingredients_text"]),
    allergens: stringList(raw.allergens_tags ?? raw.allergens),
    nutritionBasis,
    scores: {
      nutriScore,
      novaGroup: novaValue !== null && novaValue >= 1 && novaValue <= 4 ? novaValue : null,
      ecoScore,
    },
    nutrition: {
      energyKcal: numberAtNormalizedBasis(nutriments, ["energy-kcal"]),
      energyKj: numberAtNormalizedBasis(nutriments, ["energy-kj", "energy"]),
      fat: numberAtNormalizedBasis(nutriments, ["fat"]),
      saturatedFat: numberAtNormalizedBasis(nutriments, ["saturated-fat"]),
      carbohydrates: numberAtNormalizedBasis(nutriments, ["carbohydrates"]),
      sugars: numberAtNormalizedBasis(nutriments, ["sugars"]),
      fiber: numberAtNormalizedBasis(nutriments, ["fiber"]),
      proteins: numberAtNormalizedBasis(nutriments, ["proteins"]),
      salt: numberAtNormalizedBasis(nutriments, ["salt"]),
    },
    analysis: { vegan, vegetarian, palmOil },
  };
}

function extractSearchDocuments(value: unknown): { docs: UnknownRecord[]; total: number | null } {
  if (!isRecord(value)) return { docs: [], total: null };

  const hitBlock = isRecord(value.hits) ? value.hits : null;
  const rows = Array.isArray(value.products)
    ? value.products
    : Array.isArray(value.hits)
      ? value.hits
      : hitBlock && Array.isArray(hitBlock.hits)
        ? hitBlock.hits
        : [];

  const docs: UnknownRecord[] = [];
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const source = isRecord(row._source)
      ? row._source
      : isRecord(row.product)
        ? row.product
        : isRecord(row.fields)
          ? Object.fromEntries(
              Object.entries(row.fields).map(([key, entry]) => [
                key,
                Array.isArray(entry) && entry.length === 1 ? entry[0] : entry,
              ]),
            )
          : row;
    const checked = rawProductSchema.safeParse(source);
    if (!checked.success) continue;
    const document = { ...checked.data };
    if (!document.code && typeof row._id === "string") document.code = row._id;
    docs.push(document);
  }

  const totalCandidate =
    hitBlock && isRecord(hitBlock.total) ? numberValue(hitBlock.total.value) : numberValue(value.total);
  const total = totalCandidate ?? numberValue(value.count);
  return { docs, total };
}

export function normalizeSearchResults(
  value: unknown,
  page: number,
  pageSize: number,
): SearchResults {
  const { docs, total } = extractSearchDocuments(value);
  const products = docs
    .map((doc) => normalizeProduct(doc))
    .filter((product): product is Product => product !== null);
  return {
    products,
    page,
    pageSize,
    total,
    hasMore: total !== null ? page * pageSize < total : docs.length >= pageSize,
  };
}

export function cleanDisplayName(value: string | null, fallback: string): string {
  if (!value) return fallback;
  return value.replace(/\s+/g, " ").trim();
}

export function formatNumber(value: number | null, maximumFractionDigits = 2): string {
  if (value === null) return "Keine Angabe";
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits }).format(value);
}
