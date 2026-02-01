import React from 'react';
import type { MediaFieldProps } from '../types.js';

/**
 * Renders a media field (image).
 * Handles both string URLs and object format with url/alt.
 */
export function MediaField({ value, className, alt = '' }: MediaFieldProps) {
  if (!value) return null;

  const src = typeof value === 'string' ? value : value.url;
  const imgAlt = typeof value === 'string' ? alt : (value.alt || alt);

  return (
    <img
      src={src}
      alt={imgAlt}
      className={className}
    />
  );
}
