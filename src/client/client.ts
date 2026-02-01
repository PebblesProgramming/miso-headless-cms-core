import type {
  CmsClientConfig,
  CmsConfig,
  ComponentDefinition,
  FormDefinition,
  FormSubmission,
  Page,
  ApiResponse,
} from './types.js';
import fs from 'fs';
import path from 'path';

export class CmsClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(config: CmsClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
        ...options.headers,
      },
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
  async getPage(slug: string): Promise<Page> {
    const response = await this.request<ApiResponse<Page>>(`/pages/${slug}`);
    return response.data;
  }

  /**
   * Get all available component definitions
   */
  async getComponentDefinitions(): Promise<ComponentDefinition[]> {
    const response = await this.request<ApiResponse<ComponentDefinition[]>>('/component-definitions');
    return response.data;
  }

  /**
   * Get a specific component definition by slug
   */
  async getComponentDefinition(slug: string): Promise<ComponentDefinition> {
    const response = await this.request<ApiResponse<ComponentDefinition>>(`/component-definitions/${slug}`);
    return response.data;
  }

  /**
   * Get all available form definitions
   */
  async getFormDefinitions(): Promise<FormDefinition[]> {
    const response = await this.request<ApiResponse<FormDefinition[]>>('/form-definitions');
    return response.data;
  }

  /**
   * Get a specific form definition by slug
   */
  async getFormDefinition(slug: string): Promise<FormDefinition> {
    const response = await this.request<ApiResponse<FormDefinition>>(`/form-definitions/${slug}`);
    return response.data;
  }

  /**
   * Submit a form
   */
  async submitForm(submission: FormSubmission): Promise<{ success: boolean; message?: string }> {
    const response = await this.request<ApiResponse<{ success: boolean; message?: string }>>(
      `/forms/${submission.form_slug}/submit`,
      {
        method: 'POST',
        body: JSON.stringify(submission.data),
      }
    );
    return response.data;
  }

  /**
   * Sync local cms-config.json to the server
   */
  async syncConfig(config: Omit<CmsConfig, 'api'>): Promise<{ success: boolean; message?: string }> {
    const response = await this.request<ApiResponse<{ success: boolean; message?: string }>>(
      '/sync',
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
    return response.data;
  }
}

/**
 * Create a CMS client instance
 *
 * @param config - Optional config. If not provided, reads from cms-config.json
 */
export function createCmsClient(config?: CmsClientConfig): CmsClient {
  if (config) {
    return new CmsClient(config);
  }

  // Try to read from cms-config.json in project root
  const configPath = path.join(process.cwd(), 'cms-config.json');

  if (!fs.existsSync(configPath)) {
    throw new Error(
      'cms-config.json not found. Run "npx cms init" to create one, or pass config directly to createCmsClient().'
    );
  }

  const fileContent = fs.readFileSync(configPath, 'utf-8');
  const cmsConfig: CmsConfig = JSON.parse(fileContent);

  if (!cmsConfig.api?.baseUrl || !cmsConfig.api?.apiKey) {
    throw new Error(
      'cms-config.json is missing api.baseUrl or api.apiKey. Please configure these values.'
    );
  }

  return new CmsClient({
    baseUrl: cmsConfig.api.baseUrl,
    apiKey: cmsConfig.api.apiKey,
  });
}
