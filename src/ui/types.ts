import type { ReactNode, CSSProperties } from 'react';
import type { FormFieldDefinition, FormDefinition, FormSubmitResponse } from '../client/types.js';
import type { CmsClient } from '../client/client.js';

// Base props for all CMS components
export interface CmsComponentProps {
  id: number;
  content: Record<string, unknown>;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// Props for specific field types within components
export interface TextFieldProps {
  value: string;
  className?: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';
}

export interface RichTextFieldProps {
  value: string;
  className?: string;
}

export interface MediaFieldProps {
  value: string | { url: string; alt?: string };
  className?: string;
  alt?: string;
}

// Generic block renderer props
export interface CmsBlockProps {
  slug: string;
  id: number;
  content: Record<string, unknown>;
  className?: string;
  style?: CSSProperties;
  // Custom component override
  component?: React.ComponentType<CmsComponentProps>;
}

// Component registry type
export type ComponentRegistry = Map<string, React.ComponentType<CmsComponentProps>>;

// Form types
export type FormErrors = Record<string, string>;

export interface FormFieldRenderProps {
  field: FormFieldDefinition;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: string;
  inputClassName?: string;
  labelClassName?: string;
  fieldClassName?: string;
  errorClassName?: string;
}

export interface CmsFormProps {
  // Data — provide slug+client to fetch, or form for pre-fetched/SSR
  slug?: string;
  client?: CmsClient;
  form?: FormDefinition;

  // Styling
  className?: string;
  fieldClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  buttonClassName?: string;
  successClassName?: string;
  errorContainerClassName?: string;
  loadingClassName?: string;

  // Content overrides
  submitLabel?: string;
  submittingLabel?: string;
  loadingContent?: ReactNode;
  successContent?: ReactNode;
  errorContent?: ReactNode;

  // Custom field rendering
  renderField?: (props: FormFieldRenderProps) => ReactNode;

  // Callbacks
  onSuccess?: (response: FormSubmitResponse) => void;
  onError?: (error: Error) => void;
  onLoadError?: (error: Error) => void;

  // Behavior
  resetOnSuccess?: boolean;

  // Children injected before submit button
  children?: ReactNode;
}
