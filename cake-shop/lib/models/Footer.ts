import { Schema, models, model } from "mongoose";

export interface IFooterLink {
  label: string;
  href: string;
  isExternal: boolean;
}

export interface IFooterSection {
  title: string;
  links: IFooterLink[];
  order: number;
}

export interface ISocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface IFooter {
  logo: {
    imageUrl: string;
    altText: string;
  };
  description: string;
  sections: IFooterSection[];
  socialLinks: ISocialLink[];
  copyrightText: string;
  newsletterEnabled: boolean;
  updatedAt: Date;
}

const footerSchema = new Schema<IFooter>(
  {
    logo: {
      imageUrl: { type: String, default: "" },
      altText: { type: String, default: "Sweet Delights Bakery" },
    },
    description: { type: String, default: "" },
    sections: [
      {
        title: { type: String, required: true },
        links: [
          {
            label: { type: String, required: true },
            href: { type: String, required: true },
            isExternal: { type: Boolean, default: false },
          },
        ],
        order: { type: Number, default: 0 },
      },
    ],
    socialLinks: [
      {
        platform: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: "" },
      },
    ],
    copyrightText: { type: String, default: `© ${new Date().getFullYear()} Sweet Delights Bakery` },
    newsletterEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Footer = models.Footer || model<IFooter>("Footer", footerSchema);
