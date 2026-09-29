import { ExternalLink, Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="page-container flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Leaf className="h-4 w-4 text-forest" aria-hidden="true" />
            <span>Foodscope</span>
          </div>
          <p className="mt-1 text-xs text-muted">
            Daten von Open Food Facts – für eine transparentere Lebensmittelwelt.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
          <a
            href="https://world.openfoodfacts.org/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-forest"
          >
            Open Food Facts
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          <a
            href="https://opendatacommons.org/licenses/odbl/1-0/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-forest"
          >
            Datenbank: ODbL
          </a>
          <a
            href="https://world.openfoodfacts.org/terms-of-use"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-forest"
          >
            Nutzungsbedingungen
          </a>
        </div>
      </div>
    </footer>
  );
}
