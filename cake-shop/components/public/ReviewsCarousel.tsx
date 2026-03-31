"use client";

import { useEffect, useRef, useState } from "react";
import { Star, User, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  _id: string;
  username: string;
  rating: number;
  comment: string;
  cakeName: string;
}

export function ReviewsCarousel({ reviews }: { reviews: Review[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate reviews for seamless infinite scroll
  const duplicated = [...reviews, ...reviews];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reviews.length < 2) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5; // pixels per frame

    const scroll = () => {
      if (!isPaused) {
        scrollPos += speed;
        // Reset when first set scrolls out
        const halfWidth = el.scrollWidth / 2;
        if (scrollPos >= halfWidth) {
          scrollPos = 0;
        }
        el.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused, reviews.length]);

  if (reviews.length === 0) return null;

  return (
    <section className="section-padding bg-gradient-to-b from-background to-secondary/30 overflow-hidden">
      <div className="container-custom mb-10">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
            Testimonials
          </p>
          <h2 className="heading-secondary mt-2">What Our Customers Say</h2>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-hidden px-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {duplicated.map((review, index) => (
          <div
            key={`${review._id}-${index}`}
            className="w-[350px] shrink-0 rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <Quote className="h-8 w-8 text-cake-gold/30 mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 min-h-[80px]">
              &ldquo;{review.comment}&rdquo;
            </p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cake-gold/10 text-cake-brown">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{review.username}</p>
                  <p className="text-xs text-muted-foreground">{review.cakeName}</p>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
