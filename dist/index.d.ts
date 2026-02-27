type FieldType = 'text' | 'textarea' | 'richtext' | 'media' | 'number' | 'boolean' | 'date' | 'select';
interface FieldDefinition {
    name: string;
    type: FieldType;
    label: string;
    required?: boolean;
    options?: string[];
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
     * Get a form by its slug
     */
    getForm(slug: string): Promise<FormDefinition>;
    /**
     * Submit a form
     */
    submitForm(slug: string, data: Record<string, unknown>): Promise<FormSubmitResponse>;
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

export { type AgendaEvent, type AgendaEventStatus, type AgendaEventsParams, type AgendaEventsResponse, type ApiResponse, CmsClient, type CmsClientConfig, type CmsConfig, type ComponentDefinition, type FieldDefinition, type FieldType, type FormDefinition, type FormFieldDefinition, type FormFieldOption, type FormFieldType, type FormFieldValidation, type FormSubmitResponse, type Page, type PageComponent, createCmsClient };
