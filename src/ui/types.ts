import type { ReactNode, CSSProperties } from 'react';

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
