import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Visit } from "@/lib/models/Visit";
import { VisitSection } from "@/components/public/VisitSection";

export const metadata: Metadata = {
  title: "Contact",
  description: "Find our location, hours, and get in touch.",
};

async function getVisitData() {
  await connectDB();
  const visit = await Visit.findOne().lean();
  return visit ? JSON.parse(JSON.stringify(visit)) : null;
}

export default async function ContactPage() {
  const visit = await getVisitData();

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
            Get in Touch
          </p>
          <h1 className="heading-primary mt-2">Contact Us</h1>
        </div>
      </div>
      <VisitSection data={visit} />
    </div>
  );
}
