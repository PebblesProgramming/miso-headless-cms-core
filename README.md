# @miso-software/headless-cms-core

TypeScript client and React components for MISO Headless CMS.

## Installation

```bash
npm install @miso-software/headless-cms-core
```

## Setup

Initialize a config file in your project:

```bash
npx cms init
```

This creates `cms-config.json`. Update it with your API URL and key:

```json
{
  "api": {
    "baseUrl": "https://your-cms-api.com/api",
    "apiKey": "your-api-key"
  },
  "components": { ... },
  "pages": [ ... ]
}
```

Sync your config to the server:

```bash
npx cms sync
```

## Client Usage

```typescript
import { createCmsClient } from '@miso-software/headless-cms-core';

const cms = createCmsClient();

// Get a page with all its components
const page = await cms.getPage('home');

// Get a form
const form = await cms.getForm('contact');

// Submit a form
await cms.submitForm('contact', {
  name: 'John',
  email: 'john@example.com',
  message: 'Hello!'
});
```

## React Components

```tsx
import { CmsBlock, CmsPage, registerBlockRenderer } from '@miso-software/headless-cms-core/ui';

// Register how each component type should render
registerBlockRenderer('hero_section', ({ content, className }) => (
  <section className={className}>
    <h1>{content.title as string}</h1>
    <p>{content.subtitle as string}</p>
  </section>
));

// Render a single block
<CmsBlock
  slug="hero_section"
  id={1}
  content={{ title: 'Hello', subtitle: 'World' }}
/>

// Or render an entire page
const page = await cms.getPage('home');
<CmsPage components={page.components} />
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `npx cms init` | Create `cms-config.json` |
| `npx cms sync` | Sync config to CMS server |
| `npx cms help` | Show help |
