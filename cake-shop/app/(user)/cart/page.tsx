"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface CartItem {
  _id: string;
  cakeId: string;
  name: string;
  image: string;
  priceOption: {
    weight: number;
    sellPrice: number;
  };
  quantity: number;
  cakeMessage?: string;
  addons: { addonId: string; name: string; price: number; quantity: number }[];
}

interface Cart {
  items: CartItem[];
  totalAmount: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/user/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCart(data.cart || { items: [], totalAmount: 0 });
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (itemIndex: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(String(itemIndex));
    try {
      const res = await fetch("/api/user/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex, quantity }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const data = await res.json();
      setCart(data.cart || { items: [], totalAmount: 0 });
      toast.success("Cart updated");
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemIndex: number) => {
    setUpdating(String(itemIndex));
    try {
      const res = await fetch("/api/user/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      const data = await res.json();
      setCart(data.cart || { items: [], totalAmount: 0 });
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const getItemSubtotal = (item: CartItem) => {
    const addonsTotal = (item.addons || []).reduce((sum, a) => sum + a.price * a.quantity, 0);
    return item.priceOption.sellPrice * item.quantity + addonsTotal;
  };

  const getTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  };

  const total = getTotal();
  const deliveryCharge = total >= 500 ? 0 : 50;
  const grandTotal = total + deliveryCharge;

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Your Cart</h1>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-heading text-3xl font-bold mb-2">
          Your Cart is Empty
        </h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven&apos;t added any cakes yet.
        </p>
        <Button nativeButton={false} render={<Link href="/" />}>Browse Cakes</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-6">
        Your Cart ({cart.items.length} {cart.items.length === 1 ? "item" : "items"})
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, index) => (
            <Card key={item._id || index}>
              <CardContent className="flex gap-4">
                {/* Image */}
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Weight: {item.priceOption.weight} kg
                  </p>
                  <p className="text-sm font-medium">
                    {formatPrice(item.priceOption.sellPrice)}
                  </p>

                  {item.cakeMessage && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Message: &quot;{item.cakeMessage}&quot;
                    </p>
                  )}

                  {item.addons?.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {item.addons.map((addon, i) => (
                        <Badge key={i} variant="secondary">
                          {addon.name} (+{formatPrice(addon.price)})
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Quantity & Subtotal */}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={updating === String(index) || item.quantity <= 1}
                        onClick={() =>
                          updateQuantity(index, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={updating === String(index)}
                        onClick={() =>
                          updateQuantity(index, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        disabled={updating === String(index)}
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(getItemSubtotal(item))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    formatPrice(deliveryCharge)
                  )}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-muted-foreground">
                  Free delivery on orders above {formatPrice(500)}
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
              <Button
                className="w-full mt-2"
                size="lg"
                nativeButton={false}
                render={<Link href="/checkout" />}
              >
                Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
