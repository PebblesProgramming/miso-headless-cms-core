import type {
  AgendaEvent,
  AgendaEventsParams,
  AgendaEventsResponse,
  CmsClientConfig,
  CmsConfig,
  FormDefinition,
  FormSubmitResponse,
  Page,
} from './types.js';

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
        'X-API-Key': this.apiKey,
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
    return this.request<Page>(`/pages/${slug}`);
  }

  /**
   * Get a form by its slug
   */
  async getForm(slug: string): Promise<FormDefinition> {
    return this.request<FormDefinition>(`/forms/${slug}`);
  }

  /**
   * Submit a form
   */
  async submitForm(slug: string, data: Record<string, unknown>): Promise<FormSubmitResponse> {
    return this.request<FormSubmitResponse>(
      `/forms/${slug}/submit`,
      {
        method: 'POST',
        body: JSON.stringify(data),
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
  async getAgendaEvents(params: AgendaEventsParams = {}): Promise<AgendaEventsResponse> {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.upcoming) query.set('upcoming', '1');
    if (params.category) query.set('category', params.category);
    if (params.limit !== undefined) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.request<AgendaEventsResponse>(`/agenda${qs ? `?${qs}` : ''}`);
  }

  /**
   * Get a single agenda event by its slug.
   *
   * @example
   * const event = await client.getAgendaEvent('open-dag-2026');
   * console.log(event.title, event.start_at, event.location);
   */
  async getAgendaEvent(slug: string): Promise<AgendaEvent> {
    return this.request<AgendaEvent>(`/agenda/${slug}`);
  }

  /**
   * Sync local cms-config.json structure to the server
   */
  async syncStructure(config: Omit<CmsConfig, 'api'>): Promise<{ success: boolean; message?: string }> {
    return this.request<{ success: boolean; message?: string }>(
      '/sync-structure',
      {
        method: 'POST',
        body: JSON.stringify(config),
      }
    );
  }
}

/**
 * Create a CMS client instance
 *
 * @param config - Optional config. If not provided, reads from environment variables:
 *                 - CMS_API_URL (or NEXT_PUBLIC_CMS_API_URL)
 *                 - CMS_API_KEY (or NEXT_PUBLIC_CMS_API_KEY)
 */
export function createCmsClient(config?: CmsClientConfig): CmsClient {
  if (config) {
    return new CmsClient(config);
  }

  // Try environment variables
  const baseUrl = process.env.CMS_API_URL || process.env.NEXT_PUBLIC_CMS_API_URL;
  const apiKey = process.env.CMS_API_KEY || process.env.NEXT_PUBLIC_CMS_API_KEY;

  if (!baseUrl || !apiKey) {
    throw new Error(
      'CMS config not found. Either pass config to createCmsClient() or set environment variables: CMS_API_URL and CMS_API_KEY (or NEXT_PUBLIC_ prefixed versions).'
    );
  }

  return new CmsClient({ baseUrl, apiKey });
}
