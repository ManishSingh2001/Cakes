import { Metadata } from "next";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { About } from "@/lib/models/About";
import { AnimatedSection } from "@/components/public/AnimatedSection";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our story, our team, and our passion for baking.",
};

async function getAboutData() {
  await connectDB();
  const about = await About.findOne().lean();
  return about ? JSON.parse(JSON.stringify(about)) : null;
}

export default async function AboutPage() {
  const about = await getAboutData();

  if (!about) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="heading-primary">About Us</h1>
        <p className="mt-4 text-muted-foreground">Content coming soon.</p>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <AnimatedSection>
          <div className="mb-16 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
              {about.sectionTitle}
            </p>
            <h1 className="heading-primary mt-2">{about.heading}</h1>
          </div>
        </AnimatedSection>

        {/* Story + Images */}
        <div className="grid gap-12 lg:grid-cols-2">
          <AnimatedSection>
            <div
              className="prose prose-lg max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: about.description }}
            />
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <div className="grid gap-4">
              {about.images
                ?.sort((a: any, b: any) => a.order - b.order)
                .map((img: any, idx: number) => (
                  <div
                    key={idx}
                    className="relative aspect-video overflow-hidden rounded-xl"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || "About"}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
            </div>
          </AnimatedSection>
        </div>

        {/* Stats */}
        {about.stats?.length > 0 && (
          <AnimatedSection>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {about.stats.map((stat: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border bg-card p-6 text-center shadow-sm"
                >
                  <p className="font-heading text-3xl font-bold text-cake-gold">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Team */}
        {about.teamMembers?.length > 0 && (
          <div className="mt-20">
            <AnimatedSection>
              <h2 className="heading-secondary mb-10 text-center">Meet Our Team</h2>
            </AnimatedSection>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {about.teamMembers.map((member: any, idx: number) => (
                <AnimatedSection key={idx} delay={idx * 0.1}>
                  <div className="rounded-xl border bg-card p-6 text-center shadow-sm">
                    {member.image && (
                      <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-heading text-lg font-semibold">
                      {member.name}
                    </h3>
                    <p className="text-sm text-cake-gold">{member.role}</p>
                    {member.bio && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
