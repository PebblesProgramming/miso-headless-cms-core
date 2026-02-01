# @miso-software/headless-cms-core

TypeScript client and React components for MISO Headless CMS.

## Installation

```bash
# SSH
npm install git+ssh://git@github.com/PebblesProgramming/miso-headless-cms-core.git

# HTTPS (with Personal Access Token)
npm install git+https://github.com/PebblesProgramming/miso-headless-cms-core.git
```

## Setup

### 1. Initialize config (for CLI)

```bash
npx cms init
```

This creates `cms-config.json` for defining your components and pages:

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

### 2. Environment variables (for client)

Add to your `.env.local`:

```env
NEXT_PUBLIC_CMS_API_URL=https://your-cms-api.com/api
NEXT_PUBLIC_CMS_API_KEY=your-api-key
```

### 3. Sync to server

```bash
npx cms sync
```

## Client Usage

```typescript
import { createCmsClient } from "@miso-software/headless-cms-core";

// Option 1: Uses environment variables
const cms = createCmsClient();

// Option 2: Pass config directly
const cms = createCmsClient({
  baseUrl: "https://your-cms-api.com/api",
  apiKey: "your-api-key",
});

// Get a page with all its components
const page = await cms.getPage("home");

// Get a form
const form = await cms.getForm("contact");

// Submit a form
await cms.submitForm("contact", {
  name: "John",
  email: "john@example.com",
  message: "Hello!",
});
```

## React Components

```tsx
"use client";

import { createCmsClient } from "@miso-software/headless-cms-core";
import { CmsBlock, registerBlockRenderer } from "@miso-software/headless-cms-core/ui";

// Register renderers for your component types
registerBlockRenderer("hero_section", ({ content, className }) => (
  <section className={className}>
    <h1>{content.title as string}</h1>
    <p>{content.subtitle as string}</p>
  </section>
));

registerBlockRenderer("text_area", ({ content, className }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: content.content as string }} />
));

// Use in your components
export default function MyPage() {
  const [page, setPage] = useState(null);

  useEffect(() => {
    createCmsClient().getPage("home").then(setPage);
  }, []);

  if (!page) return <div>Loading...</div>;

  return (
    <div>
      {page.components.map((component) => (
        <CmsBlock
          key={component.id}
          slug={component.component_slug}
          id={component.id}
          content={component.data}
        />
      ))}
    </div>
  );
}
```

## CLI Commands

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npx cms init` | Create `cms-config.json`                 |
| `npx cms sync` | Sync components & pages to CMS server    |
| `npx cms help` | Show help                                |
