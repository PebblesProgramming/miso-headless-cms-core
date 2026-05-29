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

## Architectuur v0.2 (huidig)

### `defineBlock` — de primaire API

`defineBlock` is de **enige** manier om een CMS block te definiëren. Het combineert schema en renderer in één aanroep:

```tsx
defineBlock({
  slug: 'hero_section',
  label: 'Hero Sectie',
  fields: [
    { name: 'title', type: 'text', label: 'Titel' },
    { name: 'image', type: 'media', label: 'Afbeelding' },
  ] as const,
  render: ({ content }) => (
    // content.title en content.image zijn getypeerd vanuit de fields definitie
    <section>...</section>
  ),
});
```

Intern doet `defineBlock` twee dingen:
1. Registreert de renderer in de `rendererRegistry` (voor `CmsBlock` / preview)
2. Registreert het schema in de `schemaRegistry` (voor `npx cms sync`)

### `CmsPreviewListener` — SDK component

Niet copy-pasten. Import uit de SDK:

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

Leest `cms-config.json` voor de `pages` array én haalt component schemas op via `getRegisteredSchemas()`. POST naar `/v1/sync-structure`. Draait automatisch via `npm run dev` en `npm run build` in client projects — nooit handmatig.

### `cms-config.json` in client projects

Bevat alleen nog de `pages` array. Components komen uit `defineBlock` in code:

```json
{
  "api": { "baseUrl": "...", "apiKey": "..." },
  "pages": [
    { "slug": "home", "title": "Home", "allowed_blocks": ["hero_section", "text_area"] }
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

ESM only. Alleen `dist/` wordt gepubliceerd.

## Client (`src/client/`)

`CmsClient` met `request<T>()` methode die `X-API-Key` header toevoegt. Publieke methoden: `getPage`, `getPosts`, `getPost`, `getForm`, `submitForm`, `getAgendaEvents`, `getAgendaEvent`, `syncStructure`.

`createCmsClient()` leest `CMS_API_URL` / `CMS_API_KEY` (of `NEXT_PUBLIC_` varianten) uit `process.env` als geen config meegegeven.

## UI (`src/ui/`)

**Rendering:** `CmsBlock` gebruikt `rendererRegistry` (Map). `CmsPage` loopt over components gesorteerd op `order`. Zonder geregistreerde renderer: raw field values + dev warning.

**Field helpers:**
- `TextField` — string waarde als HTML element via `as` prop
- `RichTextField` — `dangerouslySetInnerHTML`; `prose` boolean voor Tailwind Typography. `RICH_TEXT_BASE_CSS` voor non-Tailwind setups
- `MediaField` — detecteert video op extensie (`.mp4`, `.webm`, `.ogg`, `.mov`); accepteert string of `{ url, alt }` object

**Forms:** `CmsForm` kan eigen form ophalen (`slug` + `client`) of pre-fetched form accepteren (`form`). Validatie via `validateFormData()` spiegelt backend regels.

## Key conventions

- Alle source imports gebruiken `.js` extensies (ESM Node resolution) — ook voor `.ts` bestanden
- `FieldType` ondersteunt `repeater`; `SubFieldType` sluit `repeater` uit (geen geneste repeaters)
- `AgendaEvent.whole_month` — toon als maandbereik als `true`
- `Post.content` is HTML — gebruik `RichTextField` om te renderen

## Wat NIET te doen

- Gebruik `registerBlockRenderer` niet meer direct — gebruik `defineBlock`
- Kopieer `PreviewListener` niet per project — gebruik `CmsPreviewListener` uit de SDK
- Schrijf nooit component schemas handmatig in `cms-config.json` — dat doen `defineBlock` calls

## Context

- `context/v0.1-architecture.md` — hoe het werkte vóór v0.2, waarom deprecated
- `context/decisions.md` — rationale achter architectuurkeuzes
