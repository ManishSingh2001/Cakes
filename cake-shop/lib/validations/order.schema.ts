import { z } from "zod";

export const deliveryAddressSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid zip code required"),
  landmark: z.string(),
});

export const checkoutSchema = z.object({
  deliveryAddress: deliveryAddressSchema,
  deliveryDate: z.string().min(1, "Delivery date is required"),
  deliverySlot: z.enum(["10AM-12PM", "12PM-3PM", "3PM-6PM", "6PM-9PM"]),
  specialInstructions: z.string(),
  paymentMethod: z.enum(["razorpay", "stripe", "cod", "bank_transfer"]),
});

export const orderStatusUpdateSchema = z.object({
  orderStatus: z.enum([
    "placed",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ]),
  note: z.string().default(""),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderStatusUpdateInput = z.infer<typeof orderStatusUpdateSchema>;
