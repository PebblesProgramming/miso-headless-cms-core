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
     * Get a paginated list of published posts for the tenant, sorted by published_at descending.
     *
     * @example
     * const result = await client.getPosts({ limit: 5 });
     * result.data.forEach(post => console.log(post.title, post.published_at));
     *
     * // Next page
     * const page2 = await client.getPosts({ limit: 5, page: 2 });
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

export { type AgendaEvent, type AgendaEventStatus, type AgendaEventsParams, type AgendaEventsResponse, type ApiResponse, CmsClient, type CmsClientConfig, type CmsConfig, type ComponentDefinition, type FieldDefinition, type FieldType, type FormDefinition, type FormFieldDefinition, type FormFieldOption, type FormFieldType, type FormFieldValidation, type FormSubmitResponse, type MediaAccept, type MediaInput, type MediaItem, type MediaObject, type Page, type PageComponent, type Post, type PostsParams, type PostsResponse, type SubFieldDefinition, type SubFieldType, createCmsClient, firstMedia, isVideo, toMediaArray };
