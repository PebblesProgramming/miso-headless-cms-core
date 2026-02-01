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
