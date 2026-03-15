import { Metadata } from "next";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";
import { MenuContent } from "./menu-content";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse our full collection of premium cakes and pastries.",
};

async function getCakes() {
  await connectDB();
  const cakes = await Cake.find({ isAvailable: true }).sort({ order: 1, createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(cakes));
}

export default async function MenuPage() {
  const cakes = await getCakes();

  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
            Our Collection
          </p>
          <h1 className="heading-primary mt-2">Cake Menu</h1>
        </div>
        <MenuContent initialCakes={cakes} />
      </div>
    </div>
  );
}
