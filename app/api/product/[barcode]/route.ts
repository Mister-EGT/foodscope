import { NextResponse } from "next/server";
import {
  getProductFromOpenFoodFacts,
  OpenFoodFactsError,
} from "@/lib/openfoodfacts/client";

export const revalidate = 1800;

export async function GET(
  _request: Request,
  context: { params: Promise<{ barcode: string }> },
) {
  const { barcode } = await context.params;
  try {
    const product = await getProductFromOpenFoodFacts(barcode);
    return NextResponse.json(product, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (error) {
    if (error instanceof OpenFoodFactsError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Die Produktdaten konnten gerade nicht geladen werden.", code: "UNAVAILABLE" },
      { status: 502 },
    );
  }
}
