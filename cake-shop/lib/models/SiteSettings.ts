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
  paymentGateways: {
    razorpay: {
      enabled: boolean;
      displayName: string;
      keyId: string;
      keySecret: string;
    };
    stripe: {
      enabled: boolean;
      displayName: string;
      publishableKey: string;
      secretKey: string;
    };
    cod: {
      enabled: boolean;
      displayName: string;
      instructions: string;
    };
    bankTransfer: {
      enabled: boolean;
      displayName: string;
      instructions: string;
      accountDetails: string;
    };
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
    paymentGateways: {
      razorpay: {
        enabled: { type: Boolean, default: true },
        displayName: { type: String, default: "Razorpay" },
        keyId: { type: String, default: "" },
        keySecret: { type: String, default: "" },
      },
      stripe: {
        enabled: { type: Boolean, default: false },
        displayName: { type: String, default: "Stripe" },
        publishableKey: { type: String, default: "" },
        secretKey: { type: String, default: "" },
      },
      cod: {
        enabled: { type: Boolean, default: false },
        displayName: { type: String, default: "Cash on Delivery" },
        instructions: { type: String, default: "Pay when your order is delivered." },
      },
      bankTransfer: {
        enabled: { type: Boolean, default: false },
        displayName: { type: String, default: "Bank Transfer" },
        instructions: { type: String, default: "Transfer the amount to our bank account." },
        accountDetails: { type: String, default: "" },
      },
    },
  },
  { timestamps: true }
);

export const SiteSettings = models.SiteSettings || model<ISiteSettings>("SiteSettings", siteSettingsSchema);
