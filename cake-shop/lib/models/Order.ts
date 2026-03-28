import mongoose, { Schema, models, model } from "mongoose";

export interface IOrderAddon {
  addonId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrderItem {
  cakeId: mongoose.Types.ObjectId;
  name: string;
  image: string;
  caketype: string;
  type: string;
  priceOption: {
    weight: number;
    sellPrice: number;
  };
  quantity: number;
  cakeMessage?: string;
  addons: IOrderAddon[];
  itemTotal: number;
}

export interface IStatusHistory {
  status: string;
  changedAt: Date;
  changedBy?: mongoose.Types.ObjectId;
  note?: string;
}

export interface IOrder {
  _id: string;
  orderId: string;
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
  };
  deliveryDate: Date;
  deliverySlot: string;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  totalAmount: number;
  payment: {
    method: "razorpay" | "stripe" | "cod" | "bank_transfer";
    status: "pending" | "paid" | "failed" | "refunded";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    stripePaymentIntentId?: string;
    stripeSessionId?: string;
    bankTransferReference?: string;
    paidAt?: Date;
  };
  orderStatus: "placed" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  statusHistory: IStatusHistory[];
  specialInstructions?: string;
  cancelReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        cakeId: { type: Schema.Types.ObjectId, ref: "Cake" },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        caketype: { type: String },
        type: { type: String },
        priceOption: {
          weight: { type: Number, required: true },
          sellPrice: { type: Number, required: true },
        },
        quantity: { type: Number, required: true, min: 1 },
        cakeMessage: { type: String, default: "" },
        addons: [
          {
            addonId: { type: Schema.Types.ObjectId, ref: "Addon" },
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, default: 1 },
          },
        ],
        itemTotal: { type: Number, required: true },
      },
    ],
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      landmark: { type: String, default: "" },
    },
    deliveryDate: { type: Date, required: true },
    deliverySlot: { type: String, required: true },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    payment: {
      method: { type: String, enum: ["razorpay", "stripe", "cod", "bank_transfer"], default: "razorpay" },
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      stripePaymentIntentId: { type: String },
      stripeSessionId: { type: String },
      bankTransferReference: { type: String },
      paidAt: { type: Date },
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: "User" },
        note: { type: String, default: "" },
      },
    ],
    specialInstructions: { type: String, default: "" },
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ orderId: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const Order = models.Order || model<IOrder>("Order", orderSchema);
