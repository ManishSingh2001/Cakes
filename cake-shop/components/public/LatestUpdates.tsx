import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatDate, truncate } from "@/lib/utils";
import { AnimatedSection } from "./AnimatedSection";

interface Update {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  category: string;
  publishedAt: string;
}

export function LatestUpdates({ updates }: { updates: Update[] }) {
  if (updates.length === 0) return null;

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-custom">
        <AnimatedSection>
          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
              Latest News
            </p>
            <h2 className="heading-secondary mt-2">Latest Updates</h2>
          </div>
        </AnimatedSection>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {updates.map((update, idx) => (
            <AnimatedSection key={update._id} delay={idx * 0.1}>
              <Link href={`/updates/${update.slug}`} className="group block">
                <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                  {update.coverImage && (
                    <div className="relative aspect-video overflow-hidden">
                      <Image
                        src={update.coverImage}
                        alt={update.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">{update.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(update.publishedAt)}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold line-clamp-2">
                      {update.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {truncate(update.excerpt, 120)}
                    </p>
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
