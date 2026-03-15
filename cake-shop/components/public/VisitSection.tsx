import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

interface VisitData {
  sectionTitle: string;
  heading: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  email: string;
  businessHours: { day: string; openTime: string; closeTime: string; isClosed: boolean }[];
  mapEmbedUrl: string;
}

export function VisitSection({ data }: { data: VisitData | null }) {
  if (!data) return null;

  return (
    <section className="section-padding">
      <div className="container-custom">
        <AnimatedSection>
          <div className="mb-12 text-center">
            <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
              {data.sectionTitle}
            </p>
            <h2 className="heading-secondary mt-2">{data.heading}</h2>
            {data.description && (
              <p className="mx-auto mt-4 max-w-2xl text-body text-muted-foreground">
                {data.description}
              </p>
            )}
          </div>
        </AnimatedSection>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info */}
          <AnimatedSection>
            <div className="space-y-6">
              {data.address.street && (
                <div className="flex gap-4">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-cake-gold" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-muted-foreground">
                      {data.address.street}, {data.address.city},{" "}
                      {data.address.state} {data.address.zipCode}
                    </p>
                  </div>
                </div>
              )}
              {data.phone && (
                <div className="flex gap-4">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-cake-gold" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">{data.phone}</p>
                  </div>
                </div>
              )}
              {data.email && (
                <div className="flex gap-4">
                  <Mail className="mt-1 h-5 w-5 shrink-0 text-cake-gold" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">{data.email}</p>
                  </div>
                </div>
              )}
              {data.businessHours.length > 0 && (
                <div className="flex gap-4">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-cake-gold" />
                  <div>
                    <h3 className="mb-2 font-semibold">Business Hours</h3>
                    <div className="space-y-1">
                      {data.businessHours.map((h) => (
                        <div
                          key={h.day}
                          className="flex justify-between gap-4 text-sm text-muted-foreground"
                        >
                          <span className="w-28">{h.day}</span>
                          <span>
                            {h.isClosed ? "Closed" : `${h.openTime} – ${h.closeTime}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>

          {/* Map */}
          {data.mapEmbedUrl && (
            <AnimatedSection delay={0.2}>
              <div className="aspect-video overflow-hidden rounded-xl border">
                <iframe
                  src={data.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shop Location"
                />
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </section>
  );
}
