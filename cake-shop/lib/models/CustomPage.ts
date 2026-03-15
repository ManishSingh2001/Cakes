import mongoose, { Schema, models, model } from "mongoose";

export interface ICustomPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  coverImage: string;
  isPublished: boolean;
  publishedAt?: Date;
  author: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customPageSchema = new Schema<ICustomPage>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, default: "" },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

customPageSchema.index({ isPublished: 1 });

export const CustomPage = models.CustomPage || model<ICustomPage>("CustomPage", customPageSchema);
