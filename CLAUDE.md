# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build      # Compile with tsup (outputs to dist/)
npm run dev        # Watch mode — rebuilds on file changes
npm run lint       # Type-check only (tsc --noEmit, no tests exist)
```

There are no tests. Lint is type-checking only.

## Package overview

`@miso-software/headless-cms-core` is a TypeScript library that ships two public entry points:

- **`@miso-software/headless-cms-core`** — the API client (`CmsClient` / `createCmsClient`)
- **`@miso-software/headless-cms-core/ui`** — React components, field helpers, and form components (React is a peer dependency, optional)

It also ships a CLI binary (`cms`) via `dist/cli.js`.

## Build system

`tsup.config.ts` compiles three entry points in one pass:

| Entry | Source | Output |
|---|---|---|
| `index` | `src/index.ts` | `dist/index.js` + `dist/index.d.ts` |
| `ui` | `src/ui.ts` | `dist/ui.js` + `dist/ui.d.ts` |
| `cli` | `src/cli/index.ts` | `dist/cli.js` |

Format is ESM only. The `dist/` directory is the only thing that ships in the npm package (`"files": ["dist"]`).

## Architecture

### Client (`src/client/`)

`client.ts` — `CmsClient` class with a private `request<T>()` method that attaches `X-API-Key` auth header to all calls. All public methods map to REST endpoints under `/v1/`.

`createCmsClient()` reads `CMS_API_URL` / `CMS_API_KEY` (or `NEXT_PUBLIC_` prefixed variants) from `process.env` when no config is passed.

`types.ts` — all shared TypeScript types. This is the source of truth for the data shapes coming from the CMS API. Key types:
- `FieldType` / `FieldDefinition` — component field schema
- `Page` / `PageComponent` — page and its block instances
- `FormDefinition` / `FormFieldDefinition` — form schema
- `Post` / `PostsResponse` — blog posts (Laravel paginator shape)
- `AgendaEvent` / `AgendaEventsResponse` — agenda events (also Laravel paginator)
- `CmsConfig` — shape of `cms-config.json`

### UI (`src/ui/`)

`src/ui.ts` re-exports everything from `src/ui/index.ts`.

**Component rendering pattern** — `CmsBlock` uses an in-memory `rendererRegistry` (a `Map<string, React.ComponentType>`). Call `registerBlockRenderer(slug, Component)` before rendering. Without a registered renderer, `CmsBlock` falls back to rendering raw field values and logs a dev warning. `CmsPage` wraps `CmsBlock` iteration, sorting by `order`, with optional per-slug `blockClassNames`.

**Field helpers** — standalone React components for rendering typed CMS field values:
- `TextField` — renders a string value as any HTML element via the `as` prop
- `RichTextField` — `dangerouslySetInnerHTML` wrapper; accepts a `prose` boolean to add Tailwind Typography class. Export `RICH_TEXT_BASE_CSS` is a CSS string for non-Tailwind setups; inject via `<style>` tag
- `MediaField` — detects video by extension (`.mp4`, `.webm`, `.ogg`, `.mov`), renders `<video>` or `<img>` accordingly; accepts `value` as string URL or `{ url, alt }` object

**Forms** — `CmsForm` can either fetch its own form definition (pass `slug` + `client`) or accept a pre-fetched definition (pass `form`). It manages loading/submitting/success/error states, validates via `validateFormData()` from `forms/validation.ts`, and calls `client.submitForm()`. The `renderField` prop allows fully custom field rendering; otherwise `DefaultFormField` handles all `FormFieldType` variants.

### CLI (`src/cli/index.ts`)

Single-file CLI with two commands:
- `cms init` — writes a starter `cms-config.json` to cwd (embedded template string, no runtime file reads)
- `cms sync` — reads `cms-config.json` and POSTs `{ components, pages }` to `/v1/sync-structure` with `X-API-Key` auth

Accepts `--config <path>` to override the default `cms-config.json` location.

## Key conventions

- All source imports use `.js` extensions (ESM Node resolution), even for `.ts` source files — this is required by `tsup`/Node ESM and must be maintained.
- `FieldType` supports a `repeater` type; `SubFieldType` is `FieldType` excluding `repeater` (no nested repeaters).
- `AgendaEvent.whole_month` — when `true`, display as a month range ("september 2025") rather than specific dates; `start_at`/`end_at` are set to first/last day of the month(s).
- The `Post.content` field is HTML produced by the CMS rich text editor — use `RichTextField` to render it.
