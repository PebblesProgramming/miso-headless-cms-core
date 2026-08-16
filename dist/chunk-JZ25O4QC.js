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

// src/cart.ts
var DEFAULT_KEY = "miso-cart";
var DEFAULT_MAX = 100;
var hasStorage = () => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};
var carts = /* @__PURE__ */ new Map();
function createCart(options = {}) {
  const storageKey = options.storageKey ?? DEFAULT_KEY;
  const existing = carts.get(storageKey);
  if (existing) return existing;
  const cart = buildCart(storageKey, options.maxQuantity ?? DEFAULT_MAX);
  carts.set(storageKey, cart);
  return cart;
}
function buildCart(storageKey, maxQuantity) {
  const listeners = /* @__PURE__ */ new Set();
  let memory = [];
  const read = () => {
    if (!hasStorage()) return memory;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((entry) => {
        const line = entry;
        const variantId = Number(line?.variantId);
        const quantity = Number(line?.quantity);
        if (!Number.isInteger(variantId) || variantId <= 0) return [];
        if (!Number.isInteger(quantity) || quantity <= 0) return [];
        return [{ variantId, quantity: Math.min(quantity, maxQuantity) }];
      });
    } catch {
      return [];
    }
  };
  const write = (items) => {
    memory = items;
    if (hasStorage()) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {
      }
    }
    listeners.forEach((listener) => listener(items));
    return items;
  };
  const update = (mutate) => write(mutate(read()));
  if (hasStorage()) {
    window.addEventListener("storage", (event) => {
      if (event.key !== storageKey) return;
      const items = read();
      memory = items;
      listeners.forEach((listener) => listener(items));
    });
  }
  return {
    items: read,
    count: () => read().reduce((total, line) => total + line.quantity, 0),
    add: (variantId, quantity = 1) => update((items) => {
      if (!Number.isInteger(variantId) || variantId <= 0 || quantity <= 0) {
        return items;
      }
      const existing = items.find((line) => line.variantId === variantId);
      if (!existing) {
        return [...items, { variantId, quantity: Math.min(quantity, maxQuantity) }];
      }
      return items.map(
        (line) => line.variantId === variantId ? { ...line, quantity: Math.min(line.quantity + quantity, maxQuantity) } : line
      );
    }),
    setQuantity: (variantId, quantity) => update(
      (items) => quantity <= 0 ? items.filter((line) => line.variantId !== variantId) : items.map(
        (line) => line.variantId === variantId ? { ...line, quantity: Math.min(Math.floor(quantity), maxQuantity) } : line
      )
    ),
    remove: (variantId) => update((items) => items.filter((line) => line.variantId !== variantId)),
    clear: () => write([]),
    toCheckoutItems: () => read().map((line) => ({ variant_id: line.variantId, quantity: line.quantity })),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  };
}

export {
  toMediaArray,
  firstMedia,
  isVideo,
  createCart
};
