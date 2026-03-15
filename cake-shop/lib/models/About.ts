import { Schema, models, model } from "mongoose";

export interface IAbout {
  sectionTitle: string;
  heading: string;
  description: string;
  images: { url: string; alt: string; order: number }[];
  stats: { label: string; value: string; icon: string }[];
  teamMembers: { name: string; role: string; image: string; bio: string }[];
  isVisible: boolean;
  updatedAt: Date;
}

const aboutSchema = new Schema<IAbout>(
  {
    sectionTitle: { type: String, default: "Our Story" },
    heading: { type: String, default: "Baking Happiness Since 2010" },
    description: { type: String, default: "" },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
        order: { type: Number, default: 0 },
      },
    ],
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        icon: { type: String, default: "" },
      },
    ],
    teamMembers: [
      {
        name: { type: String, required: true },
        role: { type: String, default: "" },
        image: { type: String, default: "" },
        bio: { type: String, default: "" },
      },
    ],
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const About = models.About || model<IAbout>("About", aboutSchema);
