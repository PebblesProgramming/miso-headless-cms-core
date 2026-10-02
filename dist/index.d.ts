type FieldType = 'text' | 'textarea' | 'richtext' | 'media' | 'number' | 'boolean' | 'date' | 'select' | 'repeater';
type SubFieldType = Exclude<FieldType, 'repeater'>;
type MediaAccept = 'image' | 'video' | 'any';
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
interface SubFieldDefinition extends MediaFieldConstraints {
    name: string;
    type: SubFieldType;
    label: string;
}
interface FieldDefinition extends MediaFieldConstraints {
    name: string;
    type: FieldType;
    label: string;
    required?: boolean;
    options?: string[];
    sub_fields?: SubFieldDefinition[];
}
interface ComponentDefinition {
    id: number;
    slug: string;
    label: string;
    fields: FieldDefinition[];
    created_at?: string;
    updated_at?: string;
}
interface PageComponent {
    id: number;
    page_id: number;
    component_slug: string;
    data: Record<string, unknown>;
    order?: number;
}
interface Page {
    id: number;
    slug: string;
    title: string;
    allowed_blocks: string[];
    components: PageComponent[];
}
type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';
interface FormFieldOption {
    value: string;
    label: string;
}
interface FormFieldValidation {
    required?: boolean;
    min?: number;
    max?: number;
    regex?: string;
}
interface FormFieldDefinition {
    name: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    options?: FormFieldOption[];
    validation?: FormFieldValidation;
}
interface FormSubmitResponse {
    success: boolean;
    message: string;
    submission_id: number;
}
/** Payload for `subscribeToMailing()`. */
interface MailingSubscribePayload {
    email: string;
    name?: string;
    /**
     * Free-text tags (max 20, 50 chars each), e.g. where the visitor signed up
     * (`'footer'`, `'actiepagina'`). Editors can send a campaign to a tag.
     */
    tags?: string[];
}
/**
 * Always the same, whatever state the address was in — new, already
 * subscribed or unsubscribed — so the endpoint can't reveal who is on a list.
 * The contact only counts as subscribed after clicking the link in the
 * confirmation mail (double opt-in).
 */
interface MailingSubscribeResponse {
    status: 'pending_confirmation';
}
interface FormDefinition {
    id: number;
    name: string;
    slug: string;
    fields: FormFieldDefinition[];
    success_message: string;
}
interface ApiResponse<T> {
    data: T;
    message?: string;
}
interface CmsClientConfig {
    baseUrl: string;
    apiKey: string;
}
interface Post {
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
    author: {
        id: number;
        name: string;
    } | null;
}
interface PostsParams {
    limit?: number;
    page?: number;
    /** Optional — filter to posts with this exact `category` value. Omit to get all posts. */
    category?: string;
}
interface PostsResponse {
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
type AgendaEventStatus = 'draft' | 'published' | 'cancelled';
interface AgendaEvent {
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
interface AgendaEventsParams {
    status?: AgendaEventStatus;
    /** Only return events where start_at >= now */
    upcoming?: boolean;
    category?: string;
    /** Number of results per page (max 100, default 20) */
    limit?: number;
}
interface AgendaEventsResponse {
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
interface SiteSettings {
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
/**
 * A buyable version of a product.
 *
 * Simple products have exactly one variant with `name: null` — you can treat
 * `product.variants[0]` as "the product" without branching on it.
 */
interface ProductVariant {
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
interface ProductCategory {
    id: number;
    name: string;
    slug: string;
    sort_order: number;
    /** Only present on `getProductCategories()` */
    products_count?: number;
}
interface Product {
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
interface ProductsParams {
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
interface ProductsResponse {
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
interface Address {
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
interface CheckoutPayload {
    items: {
        variant_id: number;
        quantity: number;
    }[];
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
interface CheckoutResponse {
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
type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
/**
 * A line on an order.
 *
 * These are snapshots taken at checkout, so they keep showing what the
 * customer bought even after the product is renamed, repriced or removed.
 */
interface OrderItem {
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
interface OrderWebhookPayload {
    event: 'order.paid';
    order: Order;
}
interface Order {
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
interface StockShortage {
    variant_id: number;
    requested: number;
    available: number;
}
interface CmsConfig {
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

/**
 * Any non-2xx from the CMS. Carries the status and the raw body so callers
 * can branch on it; the message is unchanged from earlier versions.
 */
declare class CmsApiError extends Error {
    readonly status: number;
    readonly body: string;
    constructor(status: number, body: string);
}
/**
 * Thrown by `checkout()` when stock ran out between browsing and paying.
 *
 * The cart itself is still valid — show the shortages and let the shopper
 * lower the quantities rather than clearing it.
 */
declare class CheckoutStockError extends Error {
    readonly shortages: StockShortage[];
    constructor(shortages: StockShortage[]);
}
declare class CmsClient {
    private baseUrl;
    private apiKey;
    constructor(config: CmsClientConfig);
    private request;
    /**
     * Get a page by its slug, including all its components with content
     */
    getPage(slug: string): Promise<Page>;
    /**
     * Get a paginated list of published posts for the tenant, sorted by published_at descending.
     *
     * @example
     * const result = await client.getPosts({ limit: 5 });
     * result.data.forEach(post => console.log(post.title, post.published_at));
     *
     * // Next page
     * const page2 = await client.getPosts({ limit: 5, page: 2 });
     *
     * // Only posts tagged "Use-case" — omit `category` to get everything, tagged or not
     * const useCases = await client.getPosts({ category: 'Use-case' });
     */
    getPosts(params?: PostsParams): Promise<PostsResponse>;
    /**
     * Get a single published post by its slug.
     *
     * @example
     * const post = await client.getPost('my-first-blog-post');
     * console.log(post.title, post.content); // content is HTML
     */
    getPost(slug: string): Promise<Post>;
    /**
     * Get a form by its slug
     */
    getForm(slug: string): Promise<FormDefinition>;
    /**
     * Submit a form
     */
    submitForm(slug: string, data: Record<string, unknown>): Promise<FormSubmitResponse>;
    /**
     * Sign a visitor up for the tenant's mailing list (newsletter).
     *
     * Always double opt-in: the CMS sends a confirmation mail and the contact
     * is only subscribed once they click it. The response is the same whether
     * the address was new or already on the list, so always show the same
     * message ("check your inbox to confirm").
     *
     * Throws {@link CmsApiError} with status 422 for an invalid address, 403
     * when the tenant doesn't have the mailing module, 429 when rate limited.
     *
     * @example
     * try {
     *   await client.subscribeToMailing({ email, name, tags: ['footer'] });
     *   setMessage('Check je inbox om je inschrijving te bevestigen.');
     * } catch (error) {
     *   if (error instanceof CmsApiError && error.status === 422) setError('Ongeldig e-mailadres');
     *   else throw error;
     * }
     */
    subscribeToMailing(payload: MailingSubscribePayload): Promise<MailingSubscribeResponse>;
    /**
     * Get a paginated list of agenda events for the tenant.
     * By default returns published events ordered by start_at ascending.
     *
     * @example
     * // All published events
     * const result = await client.getAgendaEvents();
     *
     * // Upcoming events in a specific category
     * const result = await client.getAgendaEvents({ upcoming: true, category: 'workshop' });
     *
     * result.data.forEach(event => console.log(event.title, event.start_at));
     */
    getAgendaEvents(params?: AgendaEventsParams): Promise<AgendaEventsResponse>;
    /**
     * Get a single agenda event by its slug.
     *
     * @example
     * const event = await client.getAgendaEvent('open-dag-2026');
     * console.log(event.title, event.start_at, event.location);
     */
    getAgendaEvent(slug: string): Promise<AgendaEvent>;
    /**
     * Get the site settings for the tenant (name, tagline, logo, favicon,
     * contact details, social links).
     *
     * Always resolves to a fully-populated object — unset fields are `""`,
     * never `undefined` — so it is safe to access nested keys directly.
     * Settings change rarely; cache the result (e.g. React Query with a long
     * `staleTime`, or fetch once at app init).
     *
     * @example
     * const settings = await client.getSettings();
     * document.title = settings.site_name;
     * if (settings.social.instagram) renderInstagramLink(settings.social.instagram);
     */
    getSettings(): Promise<SiteSettings>;
    /**
     * Get a paginated list of published products.
     *
     * All amounts on the result are integer cents including VAT. A simple
     * product still has one variant, so `product.variants[0]` works for both
     * simple and variable products.
     *
     * @example
     * const { data } = await client.getProducts({ category: 'jassen', in_stock: true });
     * data.forEach(p => console.log(p.title, p.variants[0].effective_price_cents));
     */
    getProducts(params?: ProductsParams): Promise<ProductsResponse>;
    /**
     * Get a single published product by its slug, with variants and categories.
     *
     * @example
     * const product = await client.getProduct('zomerjas');
     * const inStock = product.variants.filter(v => !v.track_stock || v.available > 0);
     */
    getProduct(slug: string): Promise<Product>;
    /**
     * Get the shop's categories, each with a count of published products so you
     * can hide the empty ones.
     */
    getProductCategories(): Promise<ProductCategory[]>;
    /**
     * Place an order and hold its stock.
     *
     * Send variant ids and quantities only — the server prices the order from
     * the database, so any amount you include is ignored. The hold expires at
     * `reserved_until` (30 minutes) if payment does not arrive.
     *
     * Throws {@link CheckoutStockError} when an item ran out in the meantime;
     * the cart stays valid, so show the shortages and let the shopper adjust.
     *
     * @example
     * try {
     *   const order = await client.checkout({
     *     items: cart.items.map(i => ({ variant_id: i.variantId, quantity: i.quantity })),
     *     customer_name: 'Jan Jansen',
     *     customer_email: 'jan@example.com',
     *     shipping_address: {
     *       street: 'Dorpsstraat', house_number: '1',
     *       postal_code: '1234 AB', city: 'Amsterdam', country: 'NL',
     *     },
     *   });
     *
     *   cart.clear();
     *   if (order.payment_url) window.location.href = order.payment_url;
     *   else router.push(`/bestelling/${order.token}`);
     * } catch (error) {
     *   if (error instanceof CheckoutStockError) showShortages(error.shortages);
     *   else throw error;
     * }
     */
    checkout(payload: CheckoutPayload): Promise<CheckoutResponse>;
    /**
     * Get an order by the token `checkout()` returned — for the confirmation
     * page, and for polling until the payment lands.
     *
     * @example
     * const order = await client.getOrder(token);
     * if (order.payment_status === 'paid') showThankYou(order);
     */
    getOrder(token: string): Promise<Order>;
    private parseShortages;
    /**
     * Sync local cms-config.json structure to the server
     */
    syncStructure(config: Omit<CmsConfig, 'api'>): Promise<{
        success: boolean;
        message?: string;
    }>;
}
/**
 * Create a CMS client instance
 *
 * @param config - Optional config. If not provided, reads from environment variables:
 *                 - CMS_API_URL (or NEXT_PUBLIC_CMS_API_URL)
 *                 - CMS_API_KEY (or NEXT_PUBLIC_CMS_API_KEY)
 */
declare function createCmsClient(config?: CmsClientConfig): CmsClient;

/**
 * Media normalization — framework-agnostic, no React.
 *
 * The CMS returns media fields as a **list** (`["url"]`), even for single-image
 * fields. Older/raw code coincidentally worked because JS stringifies a
 * 1-element array to its element; components that expect a single value do not.
 * These helpers are the single source of truth: they accept a string, an object
 * (`{ url | src | path, ... }`), or an array of either, and normalize to a
 * predictable `MediaItem[]` (or the first item).
 */
/** One normalized media item. */
interface MediaItem {
    url: string;
    alt?: string;
    /** e.g. "image/jpeg", "video/mp4" — present when the CMS supplies it. */
    mime?: string;
    width?: number;
    height?: number;
}
/** Loosely-typed object shape the CMS may hand back for a media item. */
interface MediaObject {
    url?: string;
    src?: string;
    path?: string;
    alt?: string;
    mime?: string;
    width?: number;
    height?: number;
}
/** Anything a media field may contain. Always treat it as a (possible) list. */
type MediaInput = string | MediaObject | ReadonlyArray<string | MediaObject> | null | undefined;
/** Normalize any media value to an array of valid items (empties dropped). */
declare function toMediaArray(input: MediaInput): MediaItem[];
/** First valid media item, or null. Use for single-image/-video slots. */
declare function firstMedia(input: MediaInput): MediaItem | null;
/**
 * Whether an item is a video. Prefers the MIME type when present, falls back to
 * an end-anchored extension check (so a URL merely *containing* ".mov" is not a
 * false positive).
 */
declare function isVideo(item: Pick<MediaItem, "url" | "mime">): boolean;

/**
 * A client-side shopping cart on localStorage.
 *
 * The cart deliberately stores **only** `variantId` and `quantity`. It never
 * persists prices or titles: a cart that sat in localStorage for a week would
 * otherwise show last month's price, and since the server reprices everything
 * at checkout the shopper would be charged a different total than they saw.
 * Look prices up with `getProducts()` / `getProduct()` when rendering.
 *
 * Framework-agnostic — see `useCart()` for the React binding.
 */
interface CartLine {
    variantId: number;
    quantity: number;
}
interface CartOptions {
    /**
     * localStorage key. Override when one origin hosts several shops.
     *
     * Calls sharing a key share one cart instance, so every consumer sees the
     * same state. Options other than the key are read from the first call.
     */
    storageKey?: string;
    /** Cap per line; the CMS rejects more than 100. Default 100. */
    maxQuantity?: number;
}
interface Cart {
    /** Current lines, in the order they were first added. */
    items: () => CartLine[];
    /** Total number of units, for a badge on the cart icon. */
    count: () => number;
    /** Adds to the existing quantity when the variant is already in the cart. */
    add: (variantId: number, quantity?: number) => CartLine[];
    /** Sets an absolute quantity; 0 or less removes the line. */
    setQuantity: (variantId: number, quantity: number) => CartLine[];
    remove: (variantId: number) => CartLine[];
    clear: () => CartLine[];
    /** Shape for `client.checkout({ items })`. */
    toCheckoutItems: () => {
        variant_id: number;
        quantity: number;
    }[];
    /** Fires whenever the cart changes, including from another browser tab. */
    subscribe: (listener: (items: CartLine[]) => void) => () => void;
}
declare function createCart(options?: CartOptions): Cart;

export { type Address, type AgendaEvent, type AgendaEventStatus, type AgendaEventsParams, type AgendaEventsResponse, type ApiResponse, type Cart, type CartLine, type CartOptions, type CheckoutPayload, type CheckoutResponse, CheckoutStockError, CmsApiError, CmsClient, type CmsClientConfig, type CmsConfig, type ComponentDefinition, type FieldDefinition, type FieldType, type FormDefinition, type FormFieldDefinition, type FormFieldOption, type FormFieldType, type FormFieldValidation, type FormSubmitResponse, type MailingSubscribePayload, type MailingSubscribeResponse, type MediaAccept, type MediaInput, type MediaItem, type MediaObject, type Order, type OrderItem, type OrderStatus, type OrderWebhookPayload, type Page, type PageComponent, type PaymentStatus, type Post, type PostsParams, type PostsResponse, type Product, type ProductCategory, type ProductVariant, type ProductsParams, type ProductsResponse, type SiteSettings, type StockShortage, type SubFieldDefinition, type SubFieldType, createCart, createCmsClient, firstMedia, isVideo, toMediaArray };
