"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useCart() {
  const { data: session } = useSession();
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!session?.user) {
      setItemCount(0);
      return;
    }
    try {
      const res = await fetch("/api/user/cart");
      if (res.ok) {
        const data = await res.json();
        const count = data.cart?.items?.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        ) ?? 0;
        setItemCount(count);
      }
    } catch {
      setItemCount(0);
    }
  }, [session?.user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const onCartUpdate = () => fetchCart();
    window.addEventListener("cart-updated", onCartUpdate);
    return () => window.removeEventListener("cart-updated", onCartUpdate);
  }, [fetchCart]);

  return { itemCount, refreshCart: fetchCart };
}
