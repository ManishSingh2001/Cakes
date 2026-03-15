import mongoose, { Schema, models, model } from "mongoose";

export interface IMedia {
  _id: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt: string;
  folder: string;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: "" },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    alt: { type: String, default: "" },
    folder: { type: String, default: "general" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

mediaSchema.index({ folder: 1 });
mediaSchema.index({ createdAt: -1 });

export const Media = models.Media || model<IMedia>("Media", mediaSchema);
