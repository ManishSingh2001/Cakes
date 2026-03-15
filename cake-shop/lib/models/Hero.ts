import { Schema, models, model } from "mongoose";

export interface IHeroSlide {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
  overlayOpacity: number;
  order: number;
  isActive: boolean;
}

export interface IHero {
  slides: IHeroSlide[];
  autoplaySpeed: number;
  updatedAt: Date;
}

const heroSchema = new Schema<IHero>(
  {
    slides: [
      {
        title: { type: String, required: true },
        subtitle: { type: String, default: "" },
        backgroundImage: { type: String, required: true },
        ctaText: { type: String, default: "Explore Our Cakes" },
        ctaLink: { type: String, default: "/menu" },
        overlayOpacity: { type: Number, default: 0.4, min: 0, max: 1 },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    autoplaySpeed: { type: Number, default: 5000 },
  },
  { timestamps: true }
);

export const Hero = models.Hero || model<IHero>("Hero", heroSchema);
