import { Schema, models, model } from "mongoose";

export interface INavLink {
  label: string;
  href: string;
  order: number;
  isVisible: boolean;
}

export interface IHeader {
  logo: {
    imageUrl: string;
    altText: string;
    linkTo: string;
  };
  navigation: INavLink[];
  ctaButton: {
    text: string;
    href: string;
    isVisible: boolean;
  };
  isSticky: boolean;
  updatedAt: Date;
}

const headerSchema = new Schema<IHeader>(
  {
    logo: {
      imageUrl: { type: String, default: "" },
      altText: { type: String, default: "Sweet Delights Bakery" },
      linkTo: { type: String, default: "/" },
    },
    navigation: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
      },
    ],
    ctaButton: {
      text: { type: String, default: "Order Now" },
      href: { type: String, default: "/menu" },
      isVisible: { type: Boolean, default: true },
    },
    isSticky: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Header = models.Header || model<IHeader>("Header", headerSchema);
