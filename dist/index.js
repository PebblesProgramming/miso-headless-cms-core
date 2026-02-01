// src/client/client.ts
import fs from "fs";
import path from "path";
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
        "Authorization": `Bearer ${this.apiKey}`,
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
    const response = await this.request(`/pages/${slug}`);
    return response.data;
  }
  /**
   * Get all available component definitions
   */
  async getComponentDefinitions() {
    const response = await this.request("/component-definitions");
    return response.data;
  }
  /**
   * Get a specific component definition by slug
   */
  async getComponentDefinition(slug) {
    const response = await this.request(`/component-definitions/${slug}`);
    return response.data;
  }
  /**
   * Get all available form definitions
   */
  async getFormDefinitions() {
    const response = await this.request("/form-definitions");
    return response.data;
  }
  /**
   * Get a specific form definition by slug
   */
  async getFormDefinition(slug) {
    const response = await this.request(`/form-definitions/${slug}`);
    return response.data;
  }
  /**
   * Submit a form
   */
  async submitForm(submission) {
    const response = await this.request(
      `/forms/${submission.form_slug}/submit`,
      {
        method: "POST",
        body: JSON.stringify(submission.data)
      }
    );
    return response.data;
  }
  /**
   * Sync local cms-config.json to the server
   */
  async syncConfig(config) {
    const response = await this.request(
      "/sync",
      {
        method: "POST",
        body: JSON.stringify(config)
      }
    );
    return response.data;
  }
};
function createCmsClient(config) {
  if (config) {
    return new CmsClient(config);
  }
  const configPath = path.join(process.cwd(), "cms-config.json");
  if (!fs.existsSync(configPath)) {
    throw new Error(
      'cms-config.json not found. Run "npx cms init" to create one, or pass config directly to createCmsClient().'
    );
  }
  const fileContent = fs.readFileSync(configPath, "utf-8");
  const cmsConfig = JSON.parse(fileContent);
  if (!cmsConfig.api?.baseUrl || !cmsConfig.api?.apiKey) {
    throw new Error(
      "cms-config.json is missing api.baseUrl or api.apiKey. Please configure these values."
    );
  }
  return new CmsClient({
    baseUrl: cmsConfig.api.baseUrl,
    apiKey: cmsConfig.api.apiKey
  });
}
export {
  CmsClient,
  createCmsClient
};
