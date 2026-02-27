// src/client/client.ts
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
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
        "Accept": "application/json",
        ...options.headers
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`CMS API Error (${response.status}): ${error}`);
    }
    return response.json();
  }
  /**
   * Get a page by its slug, including all its components with content
   */
  async getPage(slug) {
    return this.request(`/pages/${slug}`);
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
   */
  async getPosts(params = {}) {
    const query = new URLSearchParams();
    if (params.limit !== void 0) query.set("limit", String(params.limit));
    if (params.page !== void 0) query.set("page", String(params.page));
    const qs = query.toString();
    return this.request(`/posts${qs ? `?${qs}` : ""}`);
  }
  /**
   * Get a single published post by its slug.
   *
   * @example
   * const post = await client.getPost('my-first-blog-post');
   * console.log(post.title, post.content); // content is HTML
   */
  async getPost(slug) {
    return this.request(`/posts/${slug}`);
  }
  /**
   * Get a form by its slug
   */
  async getForm(slug) {
    return this.request(`/forms/${slug}`);
  }
  /**
   * Submit a form
   */
  async submitForm(slug, data) {
    return this.request(
      `/forms/${slug}/submit`,
      {
        method: "POST",
        body: JSON.stringify(data)
      }
    );
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
    return this.request(`/agenda${qs ? `?${qs}` : ""}`);
  }
  /**
   * Get a single agenda event by its slug.
   *
   * @example
   * const event = await client.getAgendaEvent('open-dag-2026');
   * console.log(event.title, event.start_at, event.location);
   */
  async getAgendaEvent(slug) {
    return this.request(`/agenda/${slug}`);
  }
  /**
   * Sync local cms-config.json structure to the server
   */
  async syncStructure(config) {
    return this.request(
      "/sync-structure",
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
  CmsClient,
  createCmsClient
};
