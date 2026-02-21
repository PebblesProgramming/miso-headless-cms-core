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

  let src: string;
  let imgAlt: string;

  if (typeof value === 'string') {
    src = value;
    imgAlt = alt;
  } else if (value && typeof value === 'object') {
    // Handle { url, alt } or any object with a url-like property
    const obj = value as Record<string, unknown>;
    src = (obj.url as string) || (obj.src as string) || (obj.path as string) || '';
    imgAlt = (obj.alt as string) || alt;
  } else {
    return null;
  }

  if (!src) return null;

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
