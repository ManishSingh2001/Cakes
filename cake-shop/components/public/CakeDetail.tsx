"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface CakeDetailProps {
  cake: any;
  addons: any[];
}

export function CakeDetail({ cake, addons }: CakeDetailProps) {
  const { data: session } = useSession();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cakeMessage, setCakeMessage] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({});

  const currentPrice = cake.prices[selectedPrice];

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const copy = { ...prev };
      if (copy[addonId]) {
        delete copy[addonId];
      } else {
        copy[addonId] = 1;
      }
      return copy;
    });
  };

  const addonsTotal = Object.entries(selectedAddons).reduce((sum, [id, qty]) => {
    const addon = addons.find((a) => a._id === id);
    return sum + (addon?.price || 0) * qty;
  }, 0);

  const total = (currentPrice?.sellPrice || 0) * quantity + addonsTotal;

  const handleAddToCart = async () => {
    if (!session) {
      toast.error("Please login to add items to cart");
      return;
    }
    try {
      const res = await fetch("/api/user/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cakeId: cake._id,
          priceOption: { weight: currentPrice.weight, sellPrice: currentPrice.sellPrice },
          quantity,
          cakeMessage,
          addons: Object.entries(selectedAddons).map(([addonId, qty]) => ({
            addonId,
            quantity: qty,
          })),
        }),
      });
      if (res.ok) toast.success("Added to cart!");
      else toast.error("Failed to add to cart");
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Images */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {cake.images[selectedImage] ? (
            <Image
              src={cake.images[selectedImage].url}
              alt={cake.images[selectedImage].alt || cake.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
        </div>
        {cake.images.length > 1 && (
          <div className="mt-4 flex gap-2">
            {cake.images.map((img: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 ${
                  idx === selectedImage ? "border-cake-gold" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt={img.alt || ""} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{cake.category}</Badge>
          <Badge variant="secondary">{cake.type}</Badge>
          <Badge variant="secondary">{cake.caketype}</Badge>
        </div>

        <h1 className="mt-3 font-heading text-3xl font-bold md:text-4xl">{cake.name}</h1>

        {/* Rating */}
        {cake.totalReviews > 0 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= cake.averageRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {cake.averageRating.toFixed(1)} ({cake.totalReviews} reviews)
            </span>
          </div>
        )}

        <p className="mt-4 text-body text-muted-foreground">{cake.description}</p>

        <Separator className="my-6" />

        {/* Weight Selection */}
        <div>
          <h3 className="mb-3 font-semibold">Select Weight</h3>
          <div className="flex flex-wrap gap-2">
            {cake.prices.map((price: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedPrice(idx)}
                className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  idx === selectedPrice
                    ? "border-cake-gold bg-cake-gold/10 text-cake-brown"
                    : "border-border hover:border-cake-gold/50"
                }`}
              >
                {price.weight >= 1000
                  ? `${price.weight / 1000} kg`
                  : `${price.weight}g`}
                {" — "}
                {formatPrice(price.sellPrice)}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="mt-6">
          <h3 className="mb-3 font-semibold">Quantity</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="rounded-lg border p-2 hover:bg-accent"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="rounded-lg border p-2 hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Cake Message */}
        <div className="mt-6">
          <h3 className="mb-3 font-semibold">Message on Cake (optional)</h3>
          <Input
            placeholder="Happy Birthday Rahul!"
            value={cakeMessage}
            onChange={(e) => setCakeMessage(e.target.value)}
            maxLength={50}
          />
        </div>

        {/* Addons */}
        {addons.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Add-ons</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {addons.map((addon) => (
                <button
                  key={addon._id}
                  onClick={() => toggleAddon(addon._id)}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                    selectedAddons[addon._id]
                      ? "border-cake-gold bg-cake-gold/10"
                      : "border-border hover:border-cake-gold/50"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium">{addon.name}</p>
                    <p className="text-muted-foreground">{formatPrice(addon.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Total & Add to Cart */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-3xl font-bold text-cake-brown">{formatPrice(total)}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleAddToCart}
              className="bg-cake-gold text-white hover:bg-cake-brown"
              size="lg"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Reviews */}
        {cake.reviews?.length > 0 && (
          <div className="mt-10">
            <h3 className="heading-secondary mb-6">Reviews</h3>
            <div className="space-y-4">
              {cake.reviews.map((review: any) => (
                <div key={review._id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{review.username}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
