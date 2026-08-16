# miso-headless-cms-core — Claude Context

## Commands

```bash
npm run build   # Compile met tsup (output naar dist/)
npm run dev     # Watch mode
npm run lint    # Type-check only (tsc --noEmit)
```

Geen tests. Lint is alleen type-checking.

## Wat dit pakket is

`@miso-software/headless-cms-core` is de gedeelde SDK voor alle Miso CMS client websites. Twee publieke entry points:

- **`@miso-software/headless-cms-core`** — API client (`CmsClient` / `createCmsClient`)
- **`@miso-software/headless-cms-core/ui`** — React rendering API (`defineBlock`, `CmsPreviewListener`, field helpers, forms)

CLI binary: `cms` via `dist/cli.js` — commando's `cms init` en `cms sync`.

## Huidige architectuur (v0.2)

### `defineBlock` — de enige manier om een block te definiëren

```tsx
import { defineBlock } from '@miso-software/headless-cms-core/ui';

defineBlock({
  slug: 'hero_section',
  label: 'Hero Sectie',
  fields: [
    { name: 'title', type: 'text', label: 'Titel' },
    { name: 'image', type: 'media', label: 'Afbeelding' },
  ] as const,               // ← as const geeft type inference op content
  render: ({ content }) => (
    // content.title: string
    // content.image: string | { url: string; alt?: string }
    <section>...</section>
  ),
});
```

Intern doet `defineBlock`:
1. Roept `registerBlockRenderer` aan (registreert renderer in `rendererRegistry` Map)
2. Slaat schema op in `schemaRegistry` Map (voor CLI sync)

### `getRegisteredSchemas()`

Geeft alle via `defineBlock` geregistreerde schemas terug als `Record<string, { label, fields }>`. Wordt gebruikt door de CLI via een tsx subprocess.

### `CmsPreviewListener`

Vervangt de copy-paste `PreviewListener.tsx` die elk project had. Luistert naar `miso-preview-update` PostMessages van de CMS admin, rendert via `CmsBlock`.

```tsx
import { CmsPreviewListener } from '@miso-software/headless-cms-core/ui';

<CmsPreviewListener
  renderLayout={(children) => (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )}
/>
```

### CLI — `cms sync`

Twee modi:

**v0.2 (aanbevolen):**
```bash
npx cms sync
```
Leest het blocks pad uit `"blocks"` in `cms-config.json`, spawnt een tsx subprocess, importeert het blocks bestand, roept `getRegisteredSchemas()` aan. Vereist `tsx` als devDependency in het client project.

De `--blocks` flag overschrijft het config pad indien nodig:
```bash
npx cms sync --blocks ./app/lib/cms-blocks.tsx
```

**Legacy fallback:**
Leest `components` uit `cms-config.json` als er geen `blocks` veld is.

### `cms-config.json` in client projects (v0.2)

Bevat `api`, `blocks` (pad naar blocks bestand), en `pages`:

```json
{
  "api": { "baseUrl": "...", "apiKey": "..." },
  "blocks": "./app/lib/cms-blocks.tsx",
  "pages": [
    { "slug": "home", "title": "Home", "allowed_blocks": ["hero_section"] }
  ]
}
```

## Build systeem

`tsup.config.ts` compileert drie entry points:

| Entry | Source | Output |
|---|---|---|
| `index` | `src/index.ts` | `dist/index.js` + `.d.ts` |
| `ui` | `src/ui.ts` | `dist/ui.js` + `.d.ts` |
| `cli` | `src/cli/index.ts` | `dist/cli.js` |

ESM only. Alleen `dist/` wordt gepubliceerd. Alle source imports gebruiken `.js` extensies (ESM Node resolution) — ook voor `.ts` bestanden.

## Client (`src/client/`)

`CmsClient` met `request<T>()` methode die `X-API-Key` header toevoegt. Publieke methoden: `getPage`, `getPosts`, `getPost`, `getForm`, `submitForm`, `getAgendaEvents`, `getAgendaEvent`, `getSettings`, `syncStructure`.

`getSettings()` haalt de per-tenant site-instellingen op (`GET /v1/settings`) als `SiteSettings`: naam, tagline, logo/favicon (volledige URLs), contact en social links. Alle velden zijn altijd aanwezig; lege velden zijn `""`. Zie `context/site-settings.md`.

`createCmsClient()` leest `CMS_API_URL` / `CMS_API_KEY` (of `NEXT_PUBLIC_` varianten) uit `process.env` als geen config meegegeven.

**Shop-methoden:** `getProducts`, `getProduct`, `getProductCategories`, `checkout`, `getOrder`.

- **Alle bedragen zijn integer centen, inclusief BTW.** Nooit floats voor geld — formatteer met `Intl.NumberFormat`.
- Een simpel product heeft óók één variant (`name: null`). `product.variants[0]` werkt voor beide soorten; niet vertakken op `has_variants`.
- `checkout()` stuurt alleen `variant_id` + `quantity`. De server prijst de bestelling zelf; alles wat op een bedrag lijkt in de payload wordt genegeerd.
- Fouten zijn nu `CmsApiError` (met `status` en `body`) in plaats van een kale `Error`. De message is ongewijzigd, dus bestaande `catch` blijft werken.
- `checkout()` gooit `CheckoutStockError` bij een 409, met `shortages: [{ variant_id, requested, available }]`. De winkelwagen blijft geldig — laat de klant aantallen verlagen in plaats van hem te legen.
- Een bestelling houdt voorraad vast tot `reserved_until` (30 min); daarna geeft het CMS de reservering vrij.

## UI (`src/ui/`)

**Rendering:** `CmsBlock` gebruikt `rendererRegistry` (Map). `CmsPage` loopt over components gesorteerd op `order`. Zonder geregistreerde renderer: raw field values + dev warning.

**Field helpers:**
- `TextField` — string waarde als HTML element via `as` prop
- `RichTextField` — `dangerouslySetInnerHTML`; `prose` boolean voor Tailwind Typography. `RICH_TEXT_BASE_CSS` voor non-Tailwind setups
- `MediaField` — detecteert video op extensie (`.mp4`, `.webm`, `.ogg`, `.mov`); accepteert string of `{ url, alt }` object

**Forms:** `CmsForm` kan eigen form ophalen (`slug` + `client`) of pre-fetched form accepteren (`form`). Validatie via `validateFormData()` spiegelt backend regels.

**Winkelwagen:** `createCart()` staat in `src/cart.ts` — framework-onafhankelijk, net als `media.ts`, en geëxporteerd vanaf zowel de root als `./ui`. `useCart()` (`src/ui/cart/`) is de React-binding en is het enige deel dat React nodig heeft.

- De wagen bewaart **alleen `variantId` en `quantity`** in localStorage. Zie "Wat NIET te doen".
- `useCart().ready` is `false` tot localStorage gelezen is. Render daarop een skeleton; anders flitst "je winkelwagen is leeg" bij elke server-rendered paginalading.
- Kapotte of vreemde localStorage-inhoud wordt bij het lezen weggefilterd — een andere tab, een oudere versie of devtools kunnen er van alles in zetten.
- Wijzigingen in een andere tab komen binnen via het `storage`-event en gaan door dezelfde subscribers.

## Type inference

`defineBlock` leidt content types af uit de `fields` array als die `as const` heeft. Type mapping:

| FieldType | TypeScript type |
|---|---|
| `text`, `textarea`, `richtext`, `date`, `select` | `string` |
| `number` | `number` |
| `boolean` | `boolean` |
| `media` | `string \| { url: string; alt?: string }` |
| `repeater` | `Record<string, unknown>[]` |

## Deprecated exports

`registerBlockRenderer` en `unregisterBlockRenderer` zijn nog steeds geëxporteerd voor backwards compatibiliteit maar zijn `@deprecated`. Gebruik `defineBlock`. Ze worden intern aangeroepen door `defineBlock` en zijn geen publieke API meer.

## Wat NIET te doen

- Gebruik `registerBlockRenderer` niet meer direct — gebruik `defineBlock`
- Kopieer `PreviewListener` niet per project — gebruik `CmsPreviewListener` uit de SDK
- Schrijf geen `components` sectie in `cms-config.json` — dat doen `defineBlock` calls
- **Bewaar nooit prijzen in de winkelwagen.** Een wagen die een week in localStorage staat toont dan bedragen van vorige maand, en omdat de server bij het afrekenen herberekent betaalt de klant iets anders dan hij zag. Sla alleen `variantId` op en haal de prijs bij het renderen op.
- Reken nooit met floats over geld. Alle bedragen uit de API zijn integer centen.
- Bouw geen eigen winkelwagen per project — gebruik `useCart()` / `createCart()`

## Context

- `context/v0.1-architecture.md` — hoe het werkte vóór v0.2, waarom deprecated
- `context/decisions.md` — rationale achter architectuurkeuzes
- `context/site-settings.md` — `getSettings()` / `SiteSettings`: shape, ophalen, cachen, gebruik in layout
