# Foodscope

Responsive food product explorer powered by Open Food Facts.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. For a production build, run `pnpm build` and then `pnpm start`.

## Features

- Search products by name, brand, or barcode.
- View product scores, nutrition, ingredients, allergens, product photos, and palm oil information when the database provides them.
- Compare up to four products side by side.
- Keep favorites and recently viewed products on this device.
- Use light, dark, or system appearance.

Foodscope reads product details from the Open Food Facts product API and uses Search-a-licious for full-text search. Product searches are proxied through the app's server routes; no API key is required. Product details are cached for 30 minutes and search results for one minute.

## Data and attribution

Open Food Facts data may be incomplete. Product data is available under the [Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/1-0/); product images are licensed under [CC BY-SA](https://creativecommons.org/licenses/by-sa/3.0/). Foodscope links to Open Food Facts and shows missing values instead of guessing them.

