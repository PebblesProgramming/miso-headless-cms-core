import React from 'react';
import type { RichTextFieldProps } from '../types.js';

/**
 * Renders rich text/HTML content.
 * Uses dangerouslySetInnerHTML - ensure content is sanitized on the server.
 */
export function RichTextField({ value, className }: RichTextFieldProps) {
  if (!value) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}
