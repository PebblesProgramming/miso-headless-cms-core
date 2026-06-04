import type { ReactNode, CSSProperties } from "react";
import type {
  FormFieldDefinition,
  FormDefinition,
  FormSubmitResponse,
} from "../client/types.js";
import type { CmsClient } from "../client/client.js";
import type { MediaInput, MediaItem } from "../media.js";

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
  as?: "p" | "span" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

export interface RichTextFieldProps {
  value: string;
  className?: string;
  /** Apply Tailwind Typography `prose` class for styled rich text rendering */
  prose?: boolean;
}

export interface MediaFieldProps {
  /** A string, object, or array — the first valid item is rendered. */
  value: MediaInput;
  className?: string;
  alt?: string;
  /** Rendered when there is no media (default: nothing). */
  fallback?: ReactNode;
  // Video options (ignored for images):
  /** Show native controls. Defaults to `!autoPlay`. */
  controls?: boolean;
  autoPlay?: boolean;
  /** Defaults to `autoPlay` (browsers require muted for autoplay). */
  muted?: boolean;
  loop?: boolean;
  /** Defaults to `true`. */
  playsInline?: boolean;
}

export interface MediaGalleryProps {
  /** A string, object, or array — normalized to a list of items. */
  value: MediaInput;
  /** Class on the wrapper element. */
  className?: string;
  /** Class on each default-rendered item (ignored when `children` is given). */
  itemClassName?: string;
  /** Rendered when there are no items (default: nothing). */
  fallback?: ReactNode;
  /** Render-prop to control per-item markup. */
  children?: (item: MediaItem, index: number) => ReactNode;
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
export type ComponentRegistry = Map<
  string,
  React.ComponentType<CmsComponentProps>
>;

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
