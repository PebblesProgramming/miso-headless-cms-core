# Site-instellingen — `cmsClient.getSettings()`

Per-tenant site-instellingen die de klant beheert in de CMS admin onder
**"Site-instellingen"** (`/admin/site-settings`). Eén blob per tenant, opgehaald
via de SDK met `getSettings()`.

## API

```
GET /api/v1/settings
Header: X-API-Key: <tenant-key>
```

Geeft het volledige `SiteSettings`-object terug. De CMS gebruikt
`SiteSetting::forTenant()` (`firstOrCreate` met defaults), dus de call geeft
**nooit een 404** — bij een nieuwe tenant krijg je het object met alle velden
op hun default (lege strings).

## Shape (`SiteSettings`)

```ts
interface SiteSettings {
  site_name: string;
  tagline: string;
  logo: string;     // volledige URL of "" — direct in <img src> te gebruiken
  favicon: string;  // volledige URL of "" — direct in <link rel="icon">
  contact: { email: string; phone: string; address: string };
  social: {
    facebook: string; instagram: string; linkedin: string;
    twitter: string; youtube: string; tiktok: string;
  };
  shop: {
    currency: string;                        // ISO 4217, nu altijd "EUR"
    default_tax_rate: number;                // 21 | 9 | 0
    shipping_cents: number;                  // integer centen
    free_shipping_from_cents: number | null; // null = altijd verzendkosten
    order_email: string;
  };
}
```

**Belangrijk:** elk veld is altijd aanwezig. Lege velden komen terug als `""`,
nooit `undefined`. Render daarom conditioneel op truthiness — toon een
social-icoon alleen als de URL niet leeg is.

Dat geldt ook voor `shop`: het blok is er voor élke tenant, ook voor wie niets
verkoopt. Test op de aanwezigheid van producten, niet op dit object.

### `shop` — verzendkosten tonen vóór het afrekenen

De server berekent verzendkosten zelf bij checkout. Wil je ze op de
winkelwagenpagina al laten zien, reken dan met dezelfde regel:

```ts
const itemsTotal = lines.reduce(
  (sum, l) => sum + l.variant.effective_price_cents * l.line.quantity, 0,
);

const { shipping_cents, free_shipping_from_cents } = settings.shop;

const shipping =
  free_shipping_from_cents !== null && itemsTotal >= free_shipping_from_cents
    ? 0
    : shipping_cents;
```

Het bedrag dat de klant betaalt komt altijd uit de `checkout()`-response —
dit is alleen om het vooraf te tonen.

## Gebruik

### Eenmalig ophalen

```ts
import { cmsClient } from './lib/cms';

const settings = await cmsClient.getSettings();
document.title = settings.site_name;
```

### React Query (aanbevolen voor client websites)

Instellingen veranderen zelden, dus cache agressief en haal één keer op bij
app-init — niet per component.

```tsx
import { useQuery } from '@tanstack/react-query';
import { cmsClient } from '../lib/cms';
import type { SiteSettings } from '@miso-software/headless-cms-core';

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: () => cmsClient.getSettings(),
    staleTime: Infinity, // ververst pas bij refetch/invalidate
  });
}
```

### In de layout

```tsx
const { data: settings } = useSiteSettings();
if (!settings) return null;

<footer>
  {settings.contact.email && <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>}
  {settings.contact.phone && <a href={`tel:${settings.contact.phone}`}>{settings.contact.phone}</a>}
  {settings.social.instagram && <a href={settings.social.instagram}>Instagram</a>}
  {settings.social.facebook && <a href={settings.social.facebook}>Facebook</a>}
</footer>
```

Typische plekken:

| Veld | Gebruik |
|---|---|
| `site_name`, `tagline` | `<title>`, header, meta tags |
| `logo`, `favicon` | header `<img>`, `<link rel="icon">` (volledige URLs) |
| `contact.*` | footer / contactpagina |
| `social.*` | footer-iconen (leeg = verbergen) |

## Waarom geen Firebase

Zie `context/decisions.md` ("Firebase voor dynamische data, CMS voor statische
content"). Site-instellingen zijn branding/marketing-content die zelden
verandert en door een beheerder wordt ingevuld — dus CMS, niet Firebase.
