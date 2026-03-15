"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";

export async function getCart() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();
  const cart = await Cart.findOne({ userId: session.user.id }).lean();
  return cart ? JSON.parse(JSON.stringify(cart)) : { items: [], totalAmount: 0 };
}

export async function clearCart() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();
  await Cart.findOneAndUpdate(
    { userId: session.user.id },
    { items: [], totalAmount: 0 }
  );
  return { success: true };
}
