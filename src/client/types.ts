// Field types supported by the CMS
export type FieldType = 'text' | 'textarea' | 'richtext' | 'media' | 'number' | 'boolean' | 'date' | 'select' | 'repeater';

// Sub-field type (same as FieldType but without repeater — no nested repeaters)
export type SubFieldType = Exclude<FieldType, 'repeater'>;

// Which media a `media` field accepts (drives the CMS editor's upload filter)
export type MediaAccept = 'image' | 'video' | 'any';

// Constraints for `media` fields — synced to the CMS so the editor enforces them
interface MediaFieldConstraints {
  /** Media fields: true = single upload, false/absent = multiple. */
  single?: boolean;
  /** Which file types the CMS editor allows. Default: "any". */
  accept?: MediaAccept;
  /** Max number of items (only meaningful when single is false). */
  maxItems?: number;
  /** Max upload size per file, in megabytes. */
  maxSizeMB?: number;
}

// Sub-field definition within a repeater field
export interface SubFieldDefinition extends MediaFieldConstraints {
  name: string;
  type: SubFieldType;
  label: string;
}

// Field definition within a component
export interface FieldDefinition extends MediaFieldConstraints {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[]; // For select fields
  sub_fields?: SubFieldDefinition[]; // Only present when type === 'repeater'
}

// Component definition from the CMS
export interface ComponentDefinition {
  id: number;
  slug: string;
  label: string;
  fields: FieldDefinition[];
  created_at?: string;
  updated_at?: string;
}

// Page component instance with actual content
export interface PageComponent {
  id: number;
  page_id: number;
  component_slug: string;
  data: Record<string, unknown>;
  order?: number;
}

// Page definition
export interface Page {
  id: number;
  slug: string;
  title: string;
  allowed_blocks: string[];
  components: PageComponent[];
}

// Form field types supported by forms
export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: string;
}

export interface FormFieldDefinition {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
}

export interface FormSubmitResponse {
  success: boolean;
  message: string;
  submission_id: number;
}

// Form definition from the CMS
export interface FormDefinition {
  id: number;
  name: string;
  slug: string;
  fields: FormFieldDefinition[];
  success_message: string;
}

// Form submission payload
export interface FormSubmission {
  form_slug: string;
  data: Record<string, unknown>;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// CMS client configuration
export interface CmsClientConfig {
  baseUrl: string;
  apiKey: string;
}

// Blog post as returned by the API
export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  /**
   * HTML string produced by the rich text editor.
   *
   * May contain: `<h1>`–`<h3>`, `<p>`, `<ul>`, `<ol>`, `<li>`, `<blockquote>`,
   * `<hr>`, `<pre><code>` (code block), `<code>` (inline), `<strong>`, `<em>`,
   * `<u>`, `<s>` (strikethrough), `<sub>`, `<sup>`, `<a>`, `<img>`,
   * `<span style="color: #hex">` (text colour),
   * `<mark style="background-color: #hex">` (highlight),
   * and elements with `style="text-align: center|right|justify"`.
   * Images may carry `style="width: X%; height: auto;"` when resized in the editor.
   *
   * Use `<RichTextField>` from `@miso-software/headless-cms-core/ui` to render.
   */
  content: string;
  featured_image: string | null;
  /**
   * Optional free-text category/tag, set per post in the CMS. `null` when unset — this field
   * is entirely optional, so existing tenants and client sites that never set it keep working
   * unchanged. A site that wants filterable posts sets it consistently (e.g. "Use-case",
   * "Blog") and passes the same value to `getPosts({ category })`.
   */
  category: string | null;
  /**
   * Display name for the author on this post.
   * Set in the CMS per post — overrides the author's account name when present.
   * Falls back to `author.name` when null.
   */
  author_name: string | null;
  /** Short bio or description of the author for this post. */
  author_bio: string | null;
  /** URL of the author's avatar image for this post. */
  author_avatar: string | null;
  /** ISO 8601 datetime string */
  published_at: string;
  author: { id: number; name: string } | null;
}

// Query parameters for listing posts
export interface PostsParams {
  limit?: number;
  page?: number;
  /** Optional — filter to posts with this exact `category` value. Omit to get all posts. */
  category?: string;
}

// Paginated posts response (Laravel paginator shape)
export interface PostsResponse {
  data: Post[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

// Agenda event status
export type AgendaEventStatus = 'draft' | 'published' | 'cancelled';

// A single agenda event as returned by the API
export interface AgendaEvent {
  id: number;
  tenant_id: number;
  created_by: number;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  /** ISO 8601 datetime string */
  start_at: string;
  /** ISO 8601 datetime string, or null if open-ended */
  end_at: string | null;
  all_day: boolean;
  /**
   * When true, the event spans one or more whole months.
   * `start_at` is set to the first day of the start month,
   * `end_at` is set to the last day of the end month (or the same month when single-month).
   * Display as "september 2025" or "juni – augustus 2025" rather than specific dates.
   */
  whole_month: boolean;
  status: AgendaEventStatus;
  /** Hex color string e.g. "#3b82f6", or null */
  color: string | null;
  category: string | null;
  max_attendees: number | null;
  registration_url: string | null;
  featured_image: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Query parameters for listing agenda events
export interface AgendaEventsParams {
  status?: AgendaEventStatus;
  /** Only return events where start_at >= now */
  upcoming?: boolean;
  category?: string;
  /** Number of results per page (max 100, default 20) */
  limit?: number;
}

// Paginated agenda events response (Laravel paginator shape)
export interface AgendaEventsResponse {
  data: AgendaEvent[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

/**
 * Site settings for a tenant, as returned by `GET /api/v1/settings`.
 *
 * Managed by the tenant in the CMS admin under "Site-instellingen".
 * Every key is always present — empty fields come back as `""` (or empty
 * nested objects), never `undefined`. Render conditionally on truthiness
 * (e.g. only show a social icon when its URL is non-empty).
 *
 * `logo` and `favicon` are full URLs (or `""`), directly usable in
 * `<img src>` / `<link rel="icon">`.
 */
export interface SiteSettings {
  site_name: string;
  tagline: string;
  /** Full URL to the logo image, or "" when unset */
  logo: string;
  /** Full URL to the favicon, or "" when unset */
  favicon: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
    youtube: string;
    tiktok: string;
  };
  /**
   * Webshop settings. Present even for tenants that do not sell anything —
   * check whether the shop has products rather than testing this object.
   *
   * Amounts are integer cents, like everywhere else in the shop API.
   */
  shop: {
    /** ISO 4217 code, currently always "EUR" */
    currency: string;
    /** 21 | 9 | 0 — the default applied to new products */
    default_tax_rate: number;
    shipping_cents: number;
    /** Order total from which shipping is free, or null when it never is */
    free_shipping_from_cents: number | null;
    /** Rate for the "local" delivery method on checkout() — 0 unless the tenant set one */
    local_delivery_cents: number;
    order_email: string;
  };
}

/* ------------------------------------------------------------------ *
 * Shop
 *
 * Every amount is an integer number of cents, inclusive of VAT. Format
 * for display with `Intl.NumberFormat`; never do arithmetic in floats.
 * ------------------------------------------------------------------ */

/**
 * A buyable version of a product.
 *
 * Simple products have exactly one variant with `name: null` — you can treat
 * `product.variants[0]` as "the product" without branching on it.
 */
export interface ProductVariant {
  id: number;
  /** "Maat L / Blauw", or null on a simple product's only variant */
  name: string | null;
  /** Structured attributes, e.g. `{ "Maat": "L", "Kleur": "Blauw" }` */
  options: Record<string, string> | null;
  sku: string | null;
  price_cents: number;
  /** Set when the variant is on sale; `effective_price_cents` already accounts for it */
  sale_price_cents: number | null;
  /** The price actually charged — the sale price when there is one */
  effective_price_cents: number;
  /** Units left to sell: stock minus what pending orders hold */
  available: number;
  /** False for unlimited items such as services; `available` is then meaningless */
  track_stock: boolean;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
  sort_order: number;
  /** Only present on `getProductCategories()` */
  products_count?: number;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  /** HTML from the rich text editor — render with `<RichTextField>` */
  description: string | null;
  /** Full image URLs, in carousel order. At most 10. */
  images: string[] | null;
  /** 21 | 9 | 0 — prices already include this */
  tax_rate: number;
  has_variants: boolean;
  brand: string | null;
  weight_grams: number | null;
  featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  /** ISO 8601 datetime string */
  published_at: string;
  variants: ProductVariant[];
  categories: ProductCategory[];
}

export interface ProductsParams {
  /** Category slug */
  category?: string;
  featured?: boolean;
  /** Only products with something left to sell */
  in_stock?: boolean;
  /** Matches title and brand */
  search?: string;
  /** Prefix with "-" for descending, e.g. "-price" */
  sort?: 'price' | '-price' | 'title' | '-title' | 'created_at' | '-created_at';
  /** Results per page (max 100, default 20) */
  limit?: number;
  page?: number;
}

export interface ProductsResponse {
  data: Product[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface Address {
  name?: string;
  street: string;
  house_number: string;
  postal_code: string;
  city: string;
  /** Two-letter ISO country code, e.g. "NL" */
  country: string;
}

/**
 * What `checkout()` sends.
 *
 * Note what is absent: prices. The server looks up every amount itself, so
 * anything money-shaped you add here is ignored.
 */
export interface CheckoutPayload {
  items: { variant_id: number; quantity: number }[];
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_note?: string;
  /**
   * How the order reaches the customer. Omit for shops that only ever ship —
   * defaults server-side to `"shipping"`. `"local"` uses a separate,
   * per-tenant rate (`shop.local_delivery_cents` from `getSettings()`) —
   * whether an address qualifies for it (e.g. a specific town) is entirely
   * up to the client site to decide before sending this.
   */
  delivery_method?: "pickup" | "local" | "shipping";
  shipping_address: Address;
  /** Defaults to the shipping address when omitted */
  billing_address?: Address;
}

export interface CheckoutResponse {
  /** Public handle for this order — use it for the confirmation page URL */
  token: string;
  number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  currency: string;
  delivery_method: "pickup" | "local" | "shipping";
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  total_cents: number;
  /** Hosted checkout to redirect to, or null when the shop settles manually */
  payment_url: string | null;
  /** ISO 8601 — the stock hold expires here if payment does not arrive */
  reserved_until: string | null;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded';

/**
 * A line on an order.
 *
 * These are snapshots taken at checkout, so they keep showing what the
 * customer bought even after the product is renamed, repriced or removed.
 */
export interface OrderItem {
  id: number;
  product_variant_id: number | null;
  product_title: string;
  variant_name: string | null;
  sku: string | null;
  unit_price_cents: number;
  tax_rate: number;
  quantity: number;
  line_subtotal_cents: number;
  line_tax_cents: number;
  line_total_cents: number;
}

/**
 * Body of the `order.paid` webhook miso-cms POSTs to a tenant's configured
 * `WebhookEndpoint` when an order is marked paid — only sent for tenants
 * that opted out of the CMS's own confirmation mail. `order` is the exact
 * same shape `getOrder()` returns. Verify the `X-Miso-Signature` header with
 * `verifyOrderWebhookSignature` (from `@miso-software/headless-cms-core/webhooks`)
 * before trusting this payload.
 */
export interface OrderWebhookPayload {
  event: 'order.paid';
  order: Order;
}

export interface Order {
  token: string;
  number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_note: string | null;
  shipping_address: Address;
  billing_address: Address | null;
  subtotal_cents: number;
  tax_cents: number;
  shipping_cents: number;
  delivery_method: "pickup" | "local" | "shipping";
  total_cents: number;
  currency: string;
  payment_url: string | null;
  /** ISO 8601 datetime strings, or null */
  reserved_until: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  created_at: string;
  items: OrderItem[];
}

/** One line of a 409 from `checkout()` — see `CheckoutStockError`. */
export interface StockShortage {
  variant_id: number;
  requested: number;
  available: number;
}

// Config file structure (cms-config.json)
export interface CmsConfig {
  api: {
    baseUrl: string;
    apiKey: string;
  };
  components: Record<string, {
    label: string;
    fields: Omit<FieldDefinition, 'required' | 'options'>[];
  }>;
  pages: {
    slug: string;
    title: string;
    allowed_blocks: string[];
  }[];
}
