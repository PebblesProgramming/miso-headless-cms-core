/**
 * A client-side shopping cart on localStorage.
 *
 * The cart deliberately stores **only** `variantId` and `quantity`. It never
 * persists prices or titles: a cart that sat in localStorage for a week would
 * otherwise show last month's price, and since the server reprices everything
 * at checkout the shopper would be charged a different total than they saw.
 * Look prices up with `getProducts()` / `getProduct()` when rendering.
 *
 * Framework-agnostic — see `useCart()` for the React binding.
 */

export interface CartLine {
  variantId: number;
  quantity: number;
}

export interface CartOptions {
  /**
   * localStorage key. Override when one origin hosts several shops.
   *
   * Calls sharing a key share one cart instance, so every consumer sees the
   * same state. Options other than the key are read from the first call.
   */
  storageKey?: string;
  /** Cap per line; the CMS rejects more than 100. Default 100. */
  maxQuantity?: number;
}

export interface Cart {
  /** Current lines, in the order they were first added. */
  items: () => CartLine[];
  /** Total number of units, for a badge on the cart icon. */
  count: () => number;
  /** Adds to the existing quantity when the variant is already in the cart. */
  add: (variantId: number, quantity?: number) => CartLine[];
  /** Sets an absolute quantity; 0 or less removes the line. */
  setQuantity: (variantId: number, quantity: number) => CartLine[];
  remove: (variantId: number) => CartLine[];
  clear: () => CartLine[];
  /** Shape for `client.checkout({ items })`. */
  toCheckoutItems: () => { variant_id: number; quantity: number }[];
  /** Fires whenever the cart changes, including from another browser tab. */
  subscribe: (listener: (items: CartLine[]) => void) => () => void;
}

const DEFAULT_KEY = 'miso-cart';
const DEFAULT_MAX = 100;

const hasStorage = (): boolean => {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    // Storage can throw on access in private mode or a sandboxed iframe.
    return false;
  }
};

/**
 * One cart per storage key.
 *
 * The `storage` event only fires in *other* documents, so two independent
 * instances in the same page — a badge in the header and the cart page, say —
 * would never hear each other's writes and would drift apart until a reload.
 * Sharing the instance makes every consumer of the same key one cart.
 */
const carts = new Map<string, Cart>();

export function createCart(options: CartOptions = {}): Cart {
  const storageKey = options.storageKey ?? DEFAULT_KEY;

  const existing = carts.get(storageKey);
  if (existing) return existing;

  const cart = buildCart(storageKey, options.maxQuantity ?? DEFAULT_MAX);
  carts.set(storageKey, cart);

  return cart;
}

function buildCart(storageKey: string, maxQuantity: number): Cart {
  const listeners = new Set<(items: CartLine[]) => void>();

  // Kept in memory too, so the cart still works during SSR and when
  // localStorage is unavailable — it just does not survive a reload.
  let memory: CartLine[] = [];

  const read = (): CartLine[] => {
    if (!hasStorage()) return memory;

    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return [];

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Anything can end up in localStorage — another tab, an older version
      // of this code, a user poking at devtools. Drop what does not fit.
      return parsed.flatMap((entry) => {
        const line = entry as Partial<CartLine>;
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

  const write = (items: CartLine[]): CartLine[] => {
    memory = items;

    if (hasStorage()) {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {
        // Quota exceeded or storage disabled: the in-memory cart still works.
      }
    }

    listeners.forEach((listener) => listener(items));

    return items;
  };

  const update = (mutate: (items: CartLine[]) => CartLine[]): CartLine[] =>
    write(mutate(read()));

  // Another tab changed the cart.
  if (hasStorage()) {
    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey) return;
      const items = read();
      memory = items;
      listeners.forEach((listener) => listener(items));
    });
  }

  return {
    items: read,

    count: () => read().reduce((total, line) => total + line.quantity, 0),

    add: (variantId, quantity = 1) =>
      update((items) => {
        if (!Number.isInteger(variantId) || variantId <= 0 || quantity <= 0) {
          return items;
        }

        const existing = items.find((line) => line.variantId === variantId);

        if (!existing) {
          return [...items, { variantId, quantity: Math.min(quantity, maxQuantity) }];
        }

        return items.map((line) =>
          line.variantId === variantId
            ? { ...line, quantity: Math.min(line.quantity + quantity, maxQuantity) }
            : line,
        );
      }),

    setQuantity: (variantId, quantity) =>
      update((items) =>
        quantity <= 0
          ? items.filter((line) => line.variantId !== variantId)
          : items.map((line) =>
              line.variantId === variantId
                ? { ...line, quantity: Math.min(Math.floor(quantity), maxQuantity) }
                : line,
            ),
      ),

    remove: (variantId) =>
      update((items) => items.filter((line) => line.variantId !== variantId)),

    clear: () => write([]),

    toCheckoutItems: () =>
      read().map((line) => ({ variant_id: line.variantId, quantity: line.quantity })),

    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
