"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface CakeCardProps {
  cake: {
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
  };
}

export function CakeCard({ cake }: CakeCardProps) {
  const minPrice = Math.min(...cake.prices.map((p) => p.sellPrice));
  const image = cake.images[0];

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/cake/${cake.slug}`} className="group block">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            {image ? (
              <Image
                src={image.url}
                alt={image.alt || cake.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No Image
              </div>
            )}
            {cake.isFeatured && (
              <Badge className="absolute left-3 top-3 bg-cake-gold text-white">
                Featured
              </Badge>
            )}
            <Badge variant="secondary" className="absolute right-3 top-3">
              {cake.type}
            </Badge>
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {cake.category}
              </Badge>
            </div>
            <h3 className="font-heading text-lg font-semibold line-clamp-1">
              {cake.name}
            </h3>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg font-bold text-cake-brown">
                {formatPrice(minPrice)}
              </span>
              {cake.totalReviews > 0 && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{cake.averageRating.toFixed(1)}</span>
                  <span>({cake.totalReviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
