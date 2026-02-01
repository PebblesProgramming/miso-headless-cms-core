import React from 'react';
import type { TextFieldProps } from '../types.js';

/**
 * Renders a text field value.
 * Minimal styling - just renders the content in the specified element.
 */
export function TextField({
  value,
  className,
  as: Element = 'p',
}: TextFieldProps) {
  if (!value) return null;

  return <Element className={className}>{value}</Element>;
}
