import mongoose, { Schema, models, model } from "mongoose";

export interface ICartAddon {
  addonId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface ICartItem {
  cakeId: mongoose.Types.ObjectId;
  sku: string;
  name: string;
  image: string;
  priceOption: {
    weight: number;
    sellPrice: number;
  };
  quantity: number;
  cakeMessage?: string;
  addons: ICartAddon[];
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;
  updatedAt: Date;
}

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [
      {
        cakeId: { type: Schema.Types.ObjectId, ref: "Cake", required: true },
        sku: { type: String, default: "" },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        priceOption: {
          weight: { type: Number, required: true },
          sellPrice: { type: Number, required: true },
        },
        quantity: { type: Number, default: 1, min: 1 },
        cakeMessage: { type: String, default: "" },
        addons: [
          {
            addonId: { type: Schema.Types.ObjectId, ref: "Addon", required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1, min: 1 },
          },
        ],
      },
    ],
    totalAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1 });

export const Cart = models.Cart || model<ICart>("Cart", cartSchema);
