import { connectDB } from "@/lib/db";
import { Hero } from "@/lib/models/Hero";
import { Cake } from "@/lib/models/Cake";
import { Update } from "@/lib/models/Update";
import { Visit } from "@/lib/models/Visit";
import { HeroSection } from "@/components/public/HeroSection";
import { CakeCard } from "@/components/public/CakeCard";
import { LatestUpdates } from "@/components/public/LatestUpdates";
import { VisitSection } from "@/components/public/VisitSection";
import { AnimatedSection } from "@/components/public/AnimatedSection";

async function getHomeData() {
  await connectDB();
  const [hero, cakes, updates, visit] = await Promise.all([
    Hero.findOne().lean(),
    Cake.find({ isFeatured: true, isAvailable: true }).sort({ order: 1 }).limit(6).lean(),
    Update.find({ isPublished: true }).sort({ publishedAt: -1 }).limit(3).lean(),
    Visit.findOne().lean(),
  ]);
  return {
    hero: hero ? JSON.parse(JSON.stringify(hero)) : null,
    cakes: JSON.parse(JSON.stringify(cakes)),
    updates: JSON.parse(JSON.stringify(updates)),
    visit: visit ? JSON.parse(JSON.stringify(visit)) : null,
  };
}

export default async function HomePage() {
  const { hero, cakes, updates, visit } = await getHomeData();

  return (
    <>
      {/* Hero */}
      {hero && (
        <HeroSection slides={hero.slides} autoplaySpeed={hero.autoplaySpeed} />
      )}

      {/* Featured Cakes */}
      {cakes.length > 0 && (
        <section className="section-padding">
          <div className="container-custom">
            <AnimatedSection>
              <div className="mb-12 text-center">
                <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
                  Handpicked for You
                </p>
                <h2 className="heading-secondary mt-2">Our Favorites</h2>
              </div>
            </AnimatedSection>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cakes.map((cake: any, idx: number) => (
                <AnimatedSection key={cake._id} delay={idx * 0.1}>
                  <CakeCard cake={cake} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Updates */}
      <LatestUpdates updates={updates} />

      {/* Visit Section */}
      <VisitSection data={visit} />
    </>
  );
}
