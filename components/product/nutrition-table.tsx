import type { Product } from "@/lib/openfoodfacts/types";
import { formatNumber } from "@/lib/openfoodfacts/helpers";

function amount(value: number | null, unit = "g"): string {
  return value === null ? "Keine Angabe" : formatNumber(value) + " " + unit;
}

export function NutritionTable({ product }: { product: Product }) {
  const energy = [
    product.nutrition.energyKj !== null
      ? formatNumber(product.nutrition.energyKj, 0) + " kJ"
      : null,
    product.nutrition.energyKcal !== null
      ? formatNumber(product.nutrition.energyKcal, 0) + " kcal"
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const rows = [
    { label: "Energie", value: energy || "Keine Angabe" },
    { label: "Fett", value: amount(product.nutrition.fat), strong: true },
    { label: "davon gesättigte Fettsäuren", value: amount(product.nutrition.saturatedFat), nested: true },
    { label: "Kohlenhydrate", value: amount(product.nutrition.carbohydrates), strong: true },
    { label: "davon Zucker", value: amount(product.nutrition.sugars), nested: true },
    { label: "Ballaststoffe", value: amount(product.nutrition.fiber) },
    { label: "Eiweiß", value: amount(product.nutrition.proteins) },
    { label: "Salz", value: amount(product.nutrition.salt) },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Nährwerte für {product.nutritionBasis} von {product.name ?? "diesem Produkt"}
        </caption>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.label} className={index > 0 ? "border-t border-line" : ""}>
              <th
                scope="row"
                className={
                  "px-3.5 py-2 text-left font-normal " +
                  (row.nested ? "pl-7 text-muted" : row.strong ? "font-medium" : "")
                }
              >
                {row.label}
              </th>
              <td className="whitespace-nowrap px-3.5 py-2 text-right text-muted">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
