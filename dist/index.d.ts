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
interface FormDefinition {
    id: number;
    slug: string;
    label: string;
    fields: FieldDefinition[];
}
interface ApiResponse<T> {
    data: T;
    message?: string;
}
interface CmsClientConfig {
    baseUrl: string;
    apiKey: string;
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
    submitForm(slug: string, data: Record<string, unknown>): Promise<{
        success: boolean;
        message?: string;
    }>;
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

export { type ApiResponse, CmsClient, type CmsClientConfig, type CmsConfig, type ComponentDefinition, type FieldDefinition, type FieldType, type FormDefinition, type Page, type PageComponent, createCmsClient };
