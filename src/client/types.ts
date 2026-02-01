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

// Form definition from the CMS
export interface FormDefinition {
  id: number;
  slug: string;
  label: string;
  fields: FieldDefinition[];
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
