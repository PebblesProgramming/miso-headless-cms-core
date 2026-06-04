import React from 'react';
import type { MediaGalleryProps } from '../types.js';
import { toMediaArray } from '../../media.js';
import { MediaField } from './MediaField.js';

/**
 * Renders MULTIPLE media items (images and/or videos).
 *
 * By default each item is rendered via `<MediaField>` inside a wrapper `<div>`.
 * Pass a `children` render-prop to control the per-item markup (captions,
 * links, lightbox triggers, …). Embeds (YouTube/Vimeo) are intentionally out of
 * scope — build a custom block with `toMediaArray()` for those.
 */
export function MediaGallery({
  value,
  className,
  itemClassName,
  fallback = null,
  children,
}: MediaGalleryProps) {
  const items = toMediaArray(value);
  if (items.length === 0) return <>{fallback}</>;

  return (
    <div className={className}>
      {items.map((item, index) =>
        children ? (
          <React.Fragment key={index}>{children(item, index)}</React.Fragment>
        ) : (
          <MediaField key={index} value={item} className={itemClassName} />
        )
      )}
    </div>
  );
}
