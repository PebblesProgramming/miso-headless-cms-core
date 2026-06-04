// src/media.ts
var VIDEO_EXTENSION = /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(?:[?#]|$)/i;
function normalizeOne(value) {
  if (!value) return null;
  if (typeof value === "string") {
    return value ? { url: value } : null;
  }
  if (typeof value === "object") {
    const url = value.url || value.src || value.path || "";
    if (!url) return null;
    const item = { url };
    if (value.alt != null) item.alt = value.alt;
    if (value.mime != null) item.mime = value.mime;
    if (value.width != null) item.width = value.width;
    if (value.height != null) item.height = value.height;
    return item;
  }
  return null;
}
function toMediaArray(input) {
  if (input == null) return [];
  const arr = Array.isArray(input) ? input : [input];
  const out = [];
  for (const entry of arr) {
    const item = normalizeOne(entry);
    if (item) out.push(item);
  }
  return out;
}
function firstMedia(input) {
  if (input == null) return null;
  const arr = Array.isArray(input) ? input : [input];
  for (const entry of arr) {
    const item = normalizeOne(entry);
    if (item) return item;
  }
  return null;
}
function isVideo(item) {
  if (item.mime) return item.mime.startsWith("video/");
  return VIDEO_EXTENSION.test(item.url);
}

export {
  toMediaArray,
  firstMedia,
  isVideo
};
