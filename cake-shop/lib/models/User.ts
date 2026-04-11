import mongoose, { Schema, models, model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "superadmin";
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  addresses: {
    _id?: string;
    label: string;
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark: string;
    isDefault: boolean;
  }[];
  wishlist: mongoose.Types.ObjectId[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin", "superadmin"], default: "user" },
    avatar: { type: String },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: "India" },
    },
    addresses: [
      {
        label: { type: String, default: "Home" },
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        landmark: { type: String, default: "" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Cake" }],
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

export const User = models.User || model<IUser>("User", userSchema);
