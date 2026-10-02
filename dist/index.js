import {
  createCart,
  firstMedia,
  isVideo,
  toMediaArray
} from "./chunk-JZ25O4QC.js";

// src/client/client.ts
var CmsApiError = class extends Error {
  constructor(status, body) {
    super(`CMS API Error (${status}): ${body}`);
    this.status = status;
    this.body = body;
    this.name = "CmsApiError";
  }
};
var CheckoutStockError = class extends Error {
  constructor(shortages) {
    super("One or more items are no longer available in the requested quantity.");
    this.shortages = shortages;
    this.name = "CheckoutStockError";
  }
};
var CmsClient = class {
  baseUrl;
  apiKey;
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
  }
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        "Accept": "application/json",
        ...options.headers
      }
    });
    if (!response.ok) {
      throw new CmsApiError(response.status, await response.text());
    }
    return response.json();
  }
  /**
   * Get a page by its slug, including all its components with content
   */
  async getPage(slug) {
    return this.request(`/v1/pages/${slug}`);
  }
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
  async getPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.limit !== void 0) query.set("limit", String(params.limit));
    if (params.page !== void 0) query.set("page", String(params.page));
    if (params.category !== void 0) query.set("category", params.category);
    const qs = query.toString();
    return this.request(`/v1/posts${qs ? `?${qs}` : ""}`);
  }
  /**
   * Get a single published post by its slug.
   *
   * @example
   * const post = await client.getPost('my-first-blog-post');
   * console.log(post.title, post.content); // content is HTML
   */
  async getPost(slug) {
    return this.request(`/v1/posts/${slug}`);
  }
  /**
   * Get a form by its slug
   */
  async getForm(slug) {
    return this.request(`/v1/forms/${slug}`);
  }
  /**
   * Submit a form
   */
  async submitForm(slug, data) {
    return this.request(
      `/v1/forms/${slug}/submit`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    );
  }
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
  async subscribeToMailing(payload) {
    return this.request("/v1/mailing/subscribe", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
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
  async getAgendaEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.upcoming) query.set("upcoming", "1");
    if (params.category) query.set("category", params.category);
    if (params.limit !== void 0) query.set("limit", String(params.limit));
    const qs = query.toString();
    return this.request(`/v1/agenda${qs ? `?${qs}` : ""}`);
  }
  /**
   * Get a single agenda event by its slug.
   *
   * @example
   * const event = await client.getAgendaEvent('open-dag-2026');
   * console.log(event.title, event.start_at, event.location);
   */
  async getAgendaEvent(slug) {
    return this.request(`/v1/agenda/${slug}`);
  }
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
  async getSettings() {
    return this.request("/v1/settings");
  }
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
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.featured) query.set("featured", "1");
    if (params.in_stock) query.set("in_stock", "1");
    if (params.search) query.set("search", params.search);
    if (params.sort) query.set("sort", params.sort);
    if (params.limit !== void 0) query.set("limit", String(params.limit));
    if (params.page !== void 0) query.set("page", String(params.page));
    const qs = query.toString();
    return this.request(`/v1/products${qs ? `?${qs}` : ""}`);
  }
  /**
   * Get a single published product by its slug, with variants and categories.
   *
   * @example
   * const product = await client.getProduct('zomerjas');
   * const inStock = product.variants.filter(v => !v.track_stock || v.available > 0);
   */
  async getProduct(slug) {
    return this.request(`/v1/products/${slug}`);
  }
  /**
   * Get the shop's categories, each with a count of published products so you
   * can hide the empty ones.
   */
  async getProductCategories() {
    const response = await this.request("/v1/product-categories");
    return response.data;
  }
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
  async checkout(payload) {
    try {
      return await this.request("/v1/checkout", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    } catch (error) {
      if (error instanceof CmsApiError && error.status === 409) {
        const shortages = this.parseShortages(error.body);
        if (shortages) throw new CheckoutStockError(shortages);
      }
      throw error;
    }
  }
  /**
   * Get an order by the token `checkout()` returned — for the confirmation
   * page, and for polling until the payment lands.
   *
   * @example
   * const order = await client.getOrder(token);
   * if (order.payment_status === 'paid') showThankYou(order);
   */
  async getOrder(token) {
    return this.request(`/v1/orders/${token}`);
  }
  parseShortages(body) {
    try {
      const parsed = JSON.parse(body);
      return Array.isArray(parsed.shortages) ? parsed.shortages : null;
    } catch {
      return null;
    }
  }
  /**
   * Sync local cms-config.json structure to the server
   */
  async syncStructure(config) {
    return this.request(
      "/v1/sync-structure",
      {
        method: "POST",
        body: JSON.stringify(config)
      }
    );
  }
};
function createCmsClient(config) {
  if (config) {
    return new CmsClient(config);
  }
  const baseUrl = process.env.CMS_API_URL || process.env.NEXT_PUBLIC_CMS_API_URL;
  const apiKey = process.env.CMS_API_KEY || process.env.NEXT_PUBLIC_CMS_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "CMS config not found. Either pass config to createCmsClient() or set environment variables: CMS_API_URL and CMS_API_KEY (or NEXT_PUBLIC_ prefixed versions)."
    );
  }
  return new CmsClient({ baseUrl, apiKey });
}
export {
  CheckoutStockError,
  CmsApiError,
  CmsClient,
  createCart,
  createCmsClient,
  firstMedia,
  isVideo,
  toMediaArray
};
