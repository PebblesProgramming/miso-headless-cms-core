import React from 'react';
import type { MediaFieldProps } from '../types.js';

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];

function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
}

/**
 * Renders a media field (image or video).
 * Handles both string URLs and object format with url/alt.
 * Automatically detects video files by extension and renders a <video> element.
 */
export function MediaField({ value, className, alt = '' }: MediaFieldProps) {
  if (!value) return null;

  const src = typeof value === 'string' ? value : value.url;
  const imgAlt = typeof value === 'string' ? alt : (value.alt || alt);

  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        controls
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={imgAlt}
      className={className}
    />
  );
}
