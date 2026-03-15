import { Schema, models, model } from "mongoose";

export interface IBusinessHour {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface IVisit {
  sectionTitle: string;
  heading: string;
  description: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  phone: string;
  email: string;
  businessHours: IBusinessHour[];
  mapEmbedUrl: string;
  images: { url: string; alt: string }[];
  isVisible: boolean;
  updatedAt: Date;
}

const visitSchema = new Schema<IVisit>(
  {
    sectionTitle: { type: String, default: "Visit Us" },
    heading: { type: String, default: "Come Experience the Magic" },
    description: { type: String, default: "" },
    address: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zipCode: { type: String, default: "" },
      country: { type: String, default: "India" },
    },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    businessHours: [
      {
        day: { type: String, required: true },
        openTime: { type: String, default: "09:00" },
        closeTime: { type: String, default: "18:00" },
        isClosed: { type: Boolean, default: false },
      },
    ],
    mapEmbedUrl: { type: String, default: "" },
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
      },
    ],
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Visit = models.Visit || model<IVisit>("Visit", visitSchema);
