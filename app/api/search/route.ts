import { NextResponse } from "next/server";
import { OpenFoodFactsError, searchOpenFoodFacts } from "@/lib/openfoodfacts/client";
import { searchQuerySchema } from "@/lib/openfoodfacts/schemas";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const parsed = searchQuerySchema.safeParse({
    q: params.get("q") ?? "",
    page: params.get("page") ?? "1",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bitte gib einen Suchbegriff ein." },
      { status: 400 },
    );
  }

  try {
    const results = await searchOpenFoodFacts(parsed.data.q, parsed.data.page);
    return NextResponse.json(results, {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=180" },
    });
  } catch (error) {
    if (error instanceof OpenFoodFactsError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "Die Suche ist gerade nicht erreichbar.", code: "UNAVAILABLE" },
      { status: 502 },
    );
  }
}
