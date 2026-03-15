import { Metadata } from "next";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";
import { AnimatedSection } from "@/components/public/AnimatedSection";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Browse our cake gallery and get inspired.",
};

async function getGalleryImages() {
  await connectDB();
  const images = await Media.find({ mimeType: { $regex: /^image/ } })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();
  return JSON.parse(JSON.stringify(images));
}

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="section-padding">
      <div className="container-custom">
        <AnimatedSection>
          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
              Our Work
            </p>
            <h1 className="heading-primary mt-2">Gallery</h1>
          </div>
        </AnimatedSection>

        {images.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No images in gallery yet.
          </p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {images.map((img: any, idx: number) => (
              <AnimatedSection key={img._id} delay={idx * 0.05}>
                <div className="mb-4 overflow-hidden rounded-xl">
                  <Image
                    src={img.url}
                    alt={img.alt || img.filename}
                    width={img.width || 600}
                    height={img.height || 400}
                    className="w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
