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

### Shop

```typescript
// List products. Filters: category, featured, in_stock, search.
// Sort: price | title | created_at, prefix with "-" for descending.
const { data: products } = await cms.getProducts({
  category: "jassen",
  in_stock: true,
  sort: "-price",
});

// One product, with its variants and categories
const product = await cms.getProduct("zomerjas");

// Categories, each with a count of published products
const categories = await cms.getProductCategories();

// Place an order
const order = await cms.checkout({
  items: [{ variant_id: 12, quantity: 2 }],
  customer_name: "Jan Jansen",
  customer_email: "jan@example.com",
  shipping_address: {
    street: "Dorpsstraat",
    house_number: "1",
    postal_code: "1234 AB",
    city: "Amsterdam",
    country: "NL",
  },
});

// Order status, for the confirmation page
const placed = await cms.getOrder(order.token);
```

**Every amount is an integer number of cents, including VAT.** Format for
display, never calculate in floats:

```typescript
const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
euro.format(product.variants[0].effective_price_cents / 100); // "€ 49,95"
```

**Simple products still have one variant**, with `name: null`. Use
`product.variants[0]` without branching on `has_variants`.

**Prices are never sent to the server.** `checkout()` posts variant ids and
quantities only; the server prices the order itself. Anything money-shaped in
the payload is ignored.

**Handle the sold-out case.** Stock can run out between browsing and paying:

```typescript
import { CheckoutStockError } from "@miso-software/headless-cms-core";

try {
  const order = await cms.checkout(payload);

  cart.clear();
  // A hosted checkout (Mollie) redirects; a shop that settles manually goes
  // straight to the confirmation page.
  if (order.payment_url) window.location.href = order.payment_url;
  else router.push(`/bestelling/${order.token}`);
} catch (error) {
  if (error instanceof CheckoutStockError) {
    // error.shortages: [{ variant_id, requested, available }]
    showShortages(error.shortages);
  } else {
    throw error;
  }
}
```

The order holds its stock until `reserved_until` (30 minutes). After that the
reservation is released and the items go back on sale.

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

### Shopping cart

`useCart()` is a localStorage-backed cart. It stores **only variant ids and
quantities** — never prices. A cart that sat in localStorage for a week would
otherwise show last month's price, and since the server reprices at checkout
the shopper would be charged something other than what they saw. Look prices
up when rendering and join on `variantId`.

```tsx
"use client";

import { useEffect, useState } from "react";
import { createCmsClient, CheckoutStockError } from "@miso-software/headless-cms-core";
import type { Product } from "@miso-software/headless-cms-core";
import { useCart } from "@miso-software/headless-cms-core/ui";

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });
const cms = createCmsClient();

export function CartPage() {
  const { items, count, ready, setQuantity, remove, clear, toCheckoutItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);

  // Prices come from the API, not from the cart.
  useEffect(() => {
    cms.getProducts({ limit: 100 }).then((r) => setProducts(r.data));
  }, []);

  const lines = items.flatMap((line) => {
    const product = products.find((p) =>
      p.variants.some((v) => v.id === line.variantId),
    );
    const variant = product?.variants.find((v) => v.id === line.variantId);

    // Dropped from the shop since it was added — skip it.
    if (!product || !variant) return [];

    return [{ line, product, variant }];
  });

  const total = lines.reduce(
    (sum, l) => sum + l.variant.effective_price_cents * l.line.quantity,
    0,
  );

  // `ready` is false until localStorage has been read. Without this an
  // "empty cart" message flashes on every load of a server-rendered page.
  if (!ready) return <CartSkeleton />;
  if (count === 0) return <p>Je winkelwagen is leeg.</p>;

  async function placeOrder() {
    try {
      const order = await cms.checkout({
        items: toCheckoutItems(),
        customer_name: "Jan Jansen",
        customer_email: "jan@example.com",
        shipping_address: {
          street: "Dorpsstraat",
          house_number: "1",
          postal_code: "1234 AB",
          city: "Amsterdam",
          country: "NL",
        },
      });

      clear();
      if (order.payment_url) window.location.href = order.payment_url;
      else window.location.href = `/bestelling/${order.token}`;
    } catch (error) {
      if (error instanceof CheckoutStockError) {
        // Keep the cart; let the shopper lower the quantities.
        error.shortages.forEach((s) => setQuantity(s.variant_id, s.available));
      } else {
        throw error;
      }
    }
  }

  return (
    <div>
      {lines.map(({ line, product, variant }) => (
        <div key={line.variantId}>
          <span>{product.title}{variant.name && ` — ${variant.name}`}</span>
          <input
            type="number"
            min={1}
            max={variant.track_stock ? variant.available : undefined}
            value={line.quantity}
            onChange={(e) => setQuantity(line.variantId, Number(e.target.value))}
          />
          <span>{euro.format(variant.effective_price_cents * line.quantity / 100)}</span>
          <button onClick={() => remove(line.variantId)}>Verwijderen</button>
        </div>
      ))}

      <strong>Totaal: {euro.format(total / 100)}</strong>
      <button onClick={placeOrder}>Afrekenen</button>
    </div>
  );
}
```

Shipping is not part of that total — the server adds it at checkout from the
tenant's settings (`settings.shop.shipping_cents` and
`free_shipping_from_cents`, both from `getSettings()`) if you want to show it
beforehand.

Outside React, `createCart()` gives the same cart with no React dependency:

```typescript
import { createCart } from "@miso-software/headless-cms-core";

const cart = createCart();
cart.add(12, 2);
const unsubscribe = cart.subscribe((items) => renderBadge(items));
await cms.checkout({ items: cart.toCheckoutItems(), ...customer });
```

## CLI Commands

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `npx cms init` | Create `cms-config.json`                 |
| `npx cms sync` | Sync components & pages to CMS server    |
| `npx cms help` | Show help                                |
