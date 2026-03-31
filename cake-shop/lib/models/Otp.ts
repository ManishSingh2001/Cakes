import { Schema, models, model } from "mongoose";

export interface IOtp {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // 5 min TTL
});

export const Otp = models.Otp || model<IOtp>("Otp", otpSchema);
