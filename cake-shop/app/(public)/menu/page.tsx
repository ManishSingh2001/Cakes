import { Metadata } from "next";
import { MenuContent } from "./menu-content";

export const metadata: Metadata = {
  title: "Menu",
  description: "Browse our full collection of premium cakes and pastries.",
};

export default function MenuPage() {
  return (
    <div className="section-padding">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-cake-gold">
            Our Collection
          </p>
          <h1 className="heading-primary mt-2">Cake Menu</h1>
        </div>
        <MenuContent />
      </div>
    </div>
  );
}
