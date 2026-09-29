import { Info } from "lucide-react";

const nutriColors: Record<string, string> = {
  a: "bg-[#038141] text-white",
  b: "bg-[#85bb2f] text-[#102418]",
  c: "bg-[#fecb02] text-[#3c3210]",
  d: "bg-[#ee8100] text-white",
  e: "bg-[#e63e11] text-white",
};

function gradeColor(grade: string | null): string {
  if (!grade) return "bg-surface-muted text-muted";
  return nutriColors[grade.toLowerCase()] ?? "bg-surface-muted text-muted";
}

export function ScoreMark({
  type,
  value,
  compact = false,
}: {
  type: "nutri" | "nova" | "eco";
  value: string | number | null;
  compact?: boolean;
}) {
  const label = type === "nutri" ? "Nutri-Score" : type === "nova" ? "NOVA" : "Eco-Score";
  const explanation =
    type === "nutri"
      ? "Bewertet die Nährwertzusammensetzung von A bis E."
      : type === "nova"
        ? "Ordnet den Verarbeitungsgrad in vier Gruppen ein."
        : "Zeigt die verfügbare Umweltbewertung des Produkts.";
  const missing = value === null || value === "";
  const score = missing ? "–" : String(value).toUpperCase();
  const className =
    type === "nutri"
      ? gradeColor(missing ? null : String(value))
      : type === "nova"
        ? "bg-forest-soft text-forest"
        : gradeColor(missing ? null : String(value));

  return (
    <div className="min-w-0">
      {!compact && (
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted">
          <span>{label}</span>
          <button
            type="button"
            className="group relative inline-flex rounded-sm text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
            aria-label={explanation}
            title={explanation}
          >
            <Info className="h-3.5 w-3.5" aria-hidden="true" />
            <span aria-hidden="true" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-52 -translate-x-1/2 rounded-md border border-line bg-surface px-3 py-2 text-left text-xs font-normal leading-5 text-ink opacity-0 shadow-soft transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              {explanation}
            </span>
          </button>
        </div>
      )}
      <div
        className={
          "inline-flex min-w-9 items-center justify-center rounded-md font-semibold leading-none " +
          className +
          (compact ? " h-8 px-2 text-sm" : " h-11 px-3 text-xl")
        }
        aria-label={missing ? label + " nicht verfügbar" : label + " " + score}
      >
        {missing ? "–" : type === "nova" ? "NOVA " + score : score}
      </div>
      {missing && !compact && <p className="mt-2 text-xs text-muted">Nicht verfügbar</p>}
    </div>
  );
}
