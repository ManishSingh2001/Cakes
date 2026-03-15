"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IHeroSlide } from "@/lib/models/Hero";

interface HeroSectionProps {
  slides: IHeroSlide[];
  autoplaySpeed?: number;
}

export function HeroSection({ slides, autoplaySpeed = 5000 }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const activeSlides = slides.filter((s) => s.isActive).sort((a, b) => a.order - b.order);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(next, autoplaySpeed);
    return () => clearInterval(timer);
  }, [next, autoplaySpeed, activeSlides.length]);

  if (activeSlides.length === 0) return null;

  const slide = activeSlides[current];

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden md:h-[85vh]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {slide.backgroundImage && (
            <Image
              src={slide.backgroundImage}
              alt={slide.title}
              fill
              className="object-cover"
              priority
            />
          )}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: slide.overlayOpacity || 0.4 }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="container-custom relative flex h-full items-center">
        <motion.div
          key={`content-${current}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl text-white"
        >
          <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl lg:text-7xl">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-4 text-lg text-white/80 md:text-xl">
              {slide.subtitle}
            </p>
          )}
          {slide.ctaText && (
            <Link href={slide.ctaLink || "/menu"}>
              <Button
                size="lg"
                className="mt-8 bg-cake-gold text-white hover:bg-cake-brown"
              >
                {slide.ctaText}
              </Button>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white transition-colors hover:bg-black/50"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {activeSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === current ? "w-8 bg-cake-gold" : "w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
