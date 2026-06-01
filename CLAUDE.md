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

## UI (`src/ui/`)

**Rendering:** `CmsBlock` gebruikt `rendererRegistry` (Map). `CmsPage` loopt over components gesorteerd op `order`. Zonder geregistreerde renderer: raw field values + dev warning.

**Field helpers:**
- `TextField` — string waarde als HTML element via `as` prop
- `RichTextField` — `dangerouslySetInnerHTML`; `prose` boolean voor Tailwind Typography. `RICH_TEXT_BASE_CSS` voor non-Tailwind setups
- `MediaField` — detecteert video op extensie (`.mp4`, `.webm`, `.ogg`, `.mov`); accepteert string of `{ url, alt }` object

**Forms:** `CmsForm` kan eigen form ophalen (`slug` + `client`) of pre-fetched form accepteren (`form`). Validatie via `validateFormData()` spiegelt backend regels.

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

## Context

- `context/v0.1-architecture.md` — hoe het werkte vóór v0.2, waarom deprecated
- `context/decisions.md` — rationale achter architectuurkeuzes
- `context/site-settings.md` — `getSettings()` / `SiteSettings`: shape, ophalen, cachen, gebruik in layout
