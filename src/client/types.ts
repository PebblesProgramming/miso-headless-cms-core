// Field types supported by the CMS
export type FieldType = 'text' | 'textarea' | 'richtext' | 'media' | 'number' | 'boolean' | 'date' | 'select';

// Field definition within a component
export interface FieldDefinition {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: string[]; // For select fields
}

// Component definition from the CMS
export interface ComponentDefinition {
  id: number;
  slug: string;
  label: string;
  fields: FieldDefinition[];
  created_at?: string;
  updated_at?: string;
}

// Page component instance with actual content
export interface PageComponent {
  id: number;
  page_id: number;
  component_slug: string;
  data: Record<string, unknown>;
  order?: number;
}

// Page definition
export interface Page {
  id: number;
  slug: string;
  title: string;
  allowed_blocks: string[];
  components: PageComponent[];
}

// Form field types supported by forms
export type FormFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  regex?: string;
}

export interface FormFieldDefinition {
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
}

export interface FormSubmitResponse {
  success: boolean;
  message: string;
  submission_id: number;
}

// Form definition from the CMS
export interface FormDefinition {
  id: number;
  name: string;
  slug: string;
  fields: FormFieldDefinition[];
  success_message: string;
}

// Form submission payload
export interface FormSubmission {
  form_slug: string;
  data: Record<string, unknown>;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// CMS client configuration
export interface CmsClientConfig {
  baseUrl: string;
  apiKey: string;
}

// Agenda event status
export type AgendaEventStatus = 'draft' | 'published' | 'cancelled';

// A single agenda event as returned by the API
export interface AgendaEvent {
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

// Query parameters for listing agenda events
export interface AgendaEventsParams {
  status?: AgendaEventStatus;
  /** Only return events where start_at >= now */
  upcoming?: boolean;
  category?: string;
  /** Number of results per page (max 100, default 20) */
  limit?: number;
}

// Paginated agenda events response (Laravel paginator shape)
export interface AgendaEventsResponse {
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

// Config file structure (cms-config.json)
export interface CmsConfig {
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
