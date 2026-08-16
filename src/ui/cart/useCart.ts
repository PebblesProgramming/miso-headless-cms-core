"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createCart, type Cart, type CartLine, type CartOptions } from '../../cart.js';

export interface UseCartResult {
  /** Empty on the first render during SSR/hydration — see `ready`. */
  items: CartLine[];
  /** Total units, for a badge. */
  count: number;
  /**
   * False until localStorage has been read on the client. Render a skeleton
   * on false rather than "your cart is empty", which would flash on every
   * page load of a server-rendered app.
   */
  ready: boolean;
  add: (variantId: number, quantity?: number) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  /** Shape for `client.checkout({ items })`. */
  toCheckoutItems: () => { variant_id: number; quantity: number }[];
  /** The underlying cart, for use outside React. */
  cart: Cart;
}

/**
 * React binding for {@link createCart}.
 *
 * Holds no prices — look them up with `getProducts()` and join on
 * `variantId`. See the README for a complete cart page.
 *
 * @example
 * const { items, count, add, ready } = useCart();
 *
 * <button onClick={() => add(variant.id)}>In winkelwagen</button>
 * {ready && count > 0 && <span className="badge">{count}</span>}
 */
export function useCart(options: CartOptions = {}): UseCartResult {
  // The cart reads localStorage, which does not exist while server
  // rendering. Start empty and fill in after mount so the markup matches.
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  const { storageKey, maxQuantity } = options;

  const cartRef = useRef<Cart | null>(null);
  if (cartRef.current === null) {
    cartRef.current = createCart({ storageKey, maxQuantity });
  }
  const cart = cartRef.current;

  useEffect(() => {
    setItems(cart.items());
    setReady(true);

    return cart.subscribe(setItems);
  }, [cart]);

  const add = useCallback(
    (variantId: number, quantity = 1) => setItems(cart.add(variantId, quantity)),
    [cart],
  );

  const setQuantity = useCallback(
    (variantId: number, quantity: number) => setItems(cart.setQuantity(variantId, quantity)),
    [cart],
  );

  const remove = useCallback(
    (variantId: number) => setItems(cart.remove(variantId)),
    [cart],
  );

  const clear = useCallback(() => setItems(cart.clear()), [cart]);

  const count = useMemo(
    () => items.reduce((total, line) => total + line.quantity, 0),
    [items],
  );

  const toCheckoutItems = useCallback(() => cart.toCheckoutItems(), [cart]);

  return { items, count, ready, add, setQuantity, remove, clear, toCheckoutItems, cart };
}
