import { Schema, models, model } from "mongoose";

export interface IAddon {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: "candles" | "toppers" | "decorations" | "packaging" | "extras";
  image: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const addonSchema = new Schema<IAddon>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    category: {
      type: String,
      enum: ["candles", "toppers", "decorations", "packaging", "extras"],
      required: true,
    },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

addonSchema.index({ category: 1 });

export const Addon = models.Addon || model<IAddon>("Addon", addonSchema);
