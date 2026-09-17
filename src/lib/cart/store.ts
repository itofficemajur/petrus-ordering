"use client";

import { useMemo, useSyncExternalStore } from "react";

type CartItem = {
  productId: string;
  quantity: number;
};

const STORAGE_KEY = "petrus-cart";
const CART_CHANGE_EVENT = "petrus-cart-change";
const EMPTY_CART = "[]";

function getCartSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
}

function getServerCartSnapshot() {
  return EMPTY_CART;
}

function subscribeToCart(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CART_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CART_CHANGE_EVENT, callback);
  };
}

function parseCart(value: string): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof item.productId === "string" &&
        item.productId.length > 0 &&
        typeof item.quantity === "number" &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  } catch {
    // The cart remains empty if browser storage is unavailable.
  }
}

export function addToCart(productId: string, quantity = 1) {
  if (!productId || !Number.isSafeInteger(quantity) || quantity < 1) return;

  const items = parseCart(getCartSnapshot());
  const existing = items.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity });
  }

  writeCart(items);
}

export function removeFromCart(productId: string) {
  writeCart(parseCart(getCartSnapshot()).filter((item) => item.productId !== productId));
}

export function clearCart() {
  writeCart([]);
}

export function useCartCount() {
  const snapshot = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);

  return useMemo(
    () => parseCart(snapshot).reduce((count, item) => count + item.quantity, 0),
    [snapshot],
  );
}
