/**
 * Media normalization — framework-agnostic, no React.
 *
 * The CMS returns media fields as a **list** (`["url"]`), even for single-image
 * fields. Older/raw code coincidentally worked because JS stringifies a
 * 1-element array to its element; components that expect a single value do not.
 * These helpers are the single source of truth: they accept a string, an object
 * (`{ url | src | path, ... }`), or an array of either, and normalize to a
 * predictable `MediaItem[]` (or the first item).
 */

/** One normalized media item. */
export interface MediaItem {
  url: string;
  alt?: string;
  /** e.g. "image/jpeg", "video/mp4" — present when the CMS supplies it. */
  mime?: string;
  width?: number;
  height?: number;
}

/** Loosely-typed object shape the CMS may hand back for a media item. */
export interface MediaObject {
  url?: string;
  src?: string;
  path?: string;
  alt?: string;
  mime?: string;
  width?: number;
  height?: number;
}

/** Anything a media field may contain. Always treat it as a (possible) list. */
export type MediaInput =
  | string
  | MediaObject
  | ReadonlyArray<string | MediaObject>
  | null
  | undefined;

const VIDEO_EXTENSION = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(?:[?#]|$)/i;

function normalizeOne(value: string | MediaObject | null | undefined): MediaItem | null {
  if (!value) return null;
  if (typeof value === "string") {
    return value ? { url: value } : null;
  }
  if (typeof value === "object") {
    const url = value.url || value.src || value.path || "";
    if (!url) return null;
    const item: MediaItem = { url };
    if (value.alt != null) item.alt = value.alt;
    if (value.mime != null) item.mime = value.mime;
    if (value.width != null) item.width = value.width;
    if (value.height != null) item.height = value.height;
    return item;
  }
  return null;
}

/** Normalize any media value to an array of valid items (empties dropped). */
export function toMediaArray(input: MediaInput): MediaItem[] {
  if (input == null) return [];
  const arr = Array.isArray(input) ? input : [input];
  const out: MediaItem[] = [];
  for (const entry of arr) {
    const item = normalizeOne(entry as string | MediaObject);
    if (item) out.push(item);
  }
  return out;
}

/** First valid media item, or null. Use for single-image/-video slots. */
export function firstMedia(input: MediaInput): MediaItem | null {
  if (input == null) return null;
  const arr = Array.isArray(input) ? input : [input];
  for (const entry of arr) {
    const item = normalizeOne(entry as string | MediaObject);
    if (item) return item;
  }
  return null;
}

/**
 * Whether an item is a video. Prefers the MIME type when present, falls back to
 * an end-anchored extension check (so a URL merely *containing* ".mov" is not a
 * false positive).
 */
export function isVideo(item: Pick<MediaItem, "url" | "mime">): boolean {
  if (item.mime) return item.mime.startsWith("video/");
  return VIDEO_EXTENSION.test(item.url);
}
