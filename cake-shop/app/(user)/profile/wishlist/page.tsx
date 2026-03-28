"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CakeCard } from "@/components/public/CakeCard";

interface WishlistCake {
  _id: string;
  name: string;
  slug: string;
  images: { url: string; alt: string }[];
  prices: { weight: number; sellPrice: number }[];
  category: string;
  caketype: string;
  type: string;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistCake[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await fetch("/api/user/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setWishlist(data.wishlist ?? []);
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (cakeId: string) => {
    setRemoving(cakeId);
    try {
      const res = await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cakeId }),
      });
      if (!res.ok) throw new Error("Failed to remove");
      setWishlist((prev) => prev.filter((c) => c._id !== cakeId));
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Failed to remove from wishlist");
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">My Wishlist</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16 text-center">
        <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="font-heading text-3xl font-bold mb-2">
          Wishlist is Empty
        </h1>
        <p className="text-muted-foreground">
          Save your favorite cakes here for later!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-heading text-3xl font-bold mb-6 flex items-center gap-2">
        <Heart className="h-8 w-8" />
        My Wishlist ({wishlist.length})
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((cake) => (
          <div key={cake._id} className="relative">
            <CakeCard cake={cake} />
            <Button
              variant="destructive"
              size="icon-sm"
              className="absolute right-2 top-2 z-10"
              disabled={removing === cake._id}
              onClick={() => removeFromWishlist(cake._id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
