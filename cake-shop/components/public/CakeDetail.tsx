"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Heart, Minus, Plus, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatPrice, formatDate } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState(cake.reviews || []);

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
      if (res.ok) {
        toast.success("Added to cart!");
        window.dispatchEvent(new Event("cart-updated"));
      } else toast.error("Failed to add to cart");
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleSubmitReview = async () => {
    if (!session) {
      toast.error("Please login to leave a review");
      return;
    }
    if (reviewRating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/user/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cakeId: cake._id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to submit review");
        setSubmittingReview(false);
        return;
      }
      toast.success("Review submitted!");
      setReviews((prev: any[]) => [
        {
          _id: Date.now().toString(),
          username: session.user?.name || "You",
          rating: reviewRating,
          comment: reviewComment,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setReviewRating(0);
      setReviewComment("");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Main product section */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-lg">
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
                  className={cn(
                    "relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all",
                    idx === selectedImage ? "border-cake-gold shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  )}
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
                    className={cn("h-5 w-5", star <= cake.averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
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
                  className={cn(
                    "rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors",
                    idx === selectedPrice
                      ? "border-cake-gold bg-cake-gold/10 text-cake-brown"
                      : "border-border hover:border-cake-gold/50"
                  )}
                >
                  {price.weight >= 1000 ? `${price.weight / 1000} kg` : `${price.weight}g`}
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
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="rounded-lg border p-2 hover:bg-accent">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="rounded-lg border p-2 hover:bg-accent">
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

          {/* Addons with Images */}
          {addons.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Add-ons</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {addons.map((addon) => {
                  const isSelected = !!selectedAddons[addon._id];
                  return (
                    <button
                      key={addon._id}
                      onClick={() => toggleAddon(addon._id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all",
                        isSelected
                          ? "border-cake-gold bg-cake-gold/10 shadow-sm"
                          : "border-border hover:border-cake-gold/50 hover:shadow-sm"
                      )}
                    >
                      {/* Addon Image */}
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {addon.image ? (
                          <Image
                            src={addon.image}
                            alt={addon.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                            <ShoppingCart className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight truncate">{addon.name}</p>
                        <p className="text-cake-brown font-semibold text-sm mt-0.5">{formatPrice(addon.price)}</p>
                      </div>
                      {/* Checkbox indicator */}
                      <div className={cn(
                        "h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-cake-gold bg-cake-gold" : "border-muted-foreground/30"
                      )}>
                        {isSelected && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
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
        </div>
      </div>

      {/* Reviews Section - Full Width */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="heading-secondary">Customer Reviews</h2>
          {cake.totalReviews > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn("h-5 w-5", star <= cake.averageRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                {cake.averageRating?.toFixed(1)} out of 5
              </span>
              <span className="text-sm text-muted-foreground">
                ({cake.totalReviews} reviews)
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Write Review Form */}
          <div className="lg:col-span-1">
            <div className="rounded-xl border bg-card p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              {session ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHover(star)}
                          onMouseLeave={() => setReviewHover(0)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={cn(
                              "h-7 w-7 transition-colors",
                              star <= (reviewHover || reviewRating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Textarea
                      placeholder="Share your experience with this cake..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || reviewRating === 0}
                    className="w-full bg-cake-gold text-white hover:bg-cake-brown"
                  >
                    {submittingReview ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Submit Review</>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please <a href="/login" className="text-cake-gold underline">login</a> to write a review.
                </p>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Star className="mx-auto h-10 w-10 mb-3" />
                <p>No reviews yet. Be the first to review this cake!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div
                    key={review._id}
                    className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cake-gold/10 text-cake-brown">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{review.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
