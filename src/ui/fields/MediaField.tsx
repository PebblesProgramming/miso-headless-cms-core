import React from 'react';
import type { MediaFieldProps } from '../types.js';
import { firstMedia, isVideo } from '../../media.js';

/**
 * Renders a SINGLE media item (image or video).
 *
 * Accepts a string, an object, or an **array** (uses the first item) — so it is
 * tolerant of the CMS always returning media as a list. Video is detected by
 * MIME type (preferred) or file extension and rendered as a `<video>`.
 *
 * For multiple items use `<MediaGallery>`; for a custom layout/carousel use
 * `toMediaArray()` and render yourself.
 */
export function MediaField({
  value,
  className,
  alt = '',
  fallback = null,
  controls,
  autoPlay = false,
  muted,
  loop = false,
  playsInline = true,
}: MediaFieldProps) {
  const item = firstMedia(value);
  if (!item) return <>{fallback}</>;

  if (isVideo(item)) {
    return (
      <video
        src={item.url}
        className={className}
        controls={controls ?? !autoPlay}
        autoPlay={autoPlay}
        muted={muted ?? autoPlay}
        loop={loop}
        playsInline={playsInline}
      />
    );
  }

  return <img src={item.url} alt={item.alt ?? alt} className={className} />;
}
