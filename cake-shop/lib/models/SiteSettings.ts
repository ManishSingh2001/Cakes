import { Schema, models, model } from "mongoose";

export interface ISiteSettings {
  siteName: string;
  tagline: string;
  favicon: string;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontHeading: string;
    fontBody: string;
  };
  maintenance: {
    isEnabled: boolean;
    message: string;
  };
  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: { type: String, default: "Sweet Delights Bakery" },
    tagline: { type: String, default: "Handcrafted Cakes & Pastries" },
    favicon: { type: String, default: "" },
    seo: {
      defaultTitle: { type: String, default: "Sweet Delights Bakery — Premium Cakes" },
      defaultDescription: { type: String, default: "Handcrafted premium cakes and pastries for every occasion." },
      ogImage: { type: String, default: "" },
    },
    theme: {
      primaryColor: { type: String, default: "#D4A574" },
      secondaryColor: { type: String, default: "#8B4513" },
      accentColor: { type: String, default: "#F5E6D3" },
      fontHeading: { type: String, default: "Playfair Display" },
      fontBody: { type: String, default: "Lato" },
    },
    maintenance: {
      isEnabled: { type: Boolean, default: false },
      message: { type: String, default: "We'll be back soon!" },
    },
  },
  { timestamps: true }
);

export const SiteSettings = models.SiteSettings || model<ISiteSettings>("SiteSettings", siteSettingsSchema);
