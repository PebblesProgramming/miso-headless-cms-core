// The cart itself is framework-agnostic and lives at the package root,
// alongside the media helpers; only the hook needs React.
export { createCart } from '../../cart.js';
export type { Cart, CartLine, CartOptions } from '../../cart.js';

export { useCart } from './useCart.js';
export type { UseCartResult } from './useCart.js';
