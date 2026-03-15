import mongoose, { Schema, models, model } from "mongoose";

export interface IUpdate {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const updateSchema = new Schema<IUpdate>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    category: { type: String, default: "News" },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

updateSchema.index({ isPublished: 1, publishedAt: -1 });

export const Update = models.Update || model<IUpdate>("Update", updateSchema);
