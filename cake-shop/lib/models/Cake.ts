import mongoose, { Schema, models, model } from "mongoose";

export interface IPriceOption {
  weight: number;
  costPrice: number;
  sellPrice: number;
}

export interface IReview {
  userId: mongoose.Types.ObjectId;
  username: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICake {
  _id: string;
  name: string;
  description: string;
  caketype: "cake" | "pastries";
  type: "eggless" | "egg";
  category: string;
  slug: string;
  images: { url: string; alt: string }[];
  prices: IPriceOption[];
  tags: string[];
  isFeatured: boolean;
  isAvailable: boolean;
  reviews: IReview[];
  averageRating: number;
  totalReviews: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const priceSchema = new Schema<IPriceOption>(
  {
    weight: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
  },
  { _id: false }
);

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

const cakeSchema = new Schema<ICake>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    caketype: { type: String, enum: ["cake", "pastries"], required: true },
    type: { type: String, enum: ["eggless", "egg"], required: true },
    category: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    prices: [priceSchema],
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cakeSchema.index({ caketype: 1, type: 1, category: 1 });
cakeSchema.index({ isFeatured: 1 });

export const Cake = models.Cake || model<ICake>("Cake", cakeSchema);
