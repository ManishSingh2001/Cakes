"use server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";

export async function getOrder(orderId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();
  const order = await Order.findOne({ orderId, userId: session.user.id }).lean();
  return order ? JSON.parse(JSON.stringify(order)) : null;
}

export async function getUserOrders() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await connectDB();
  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(orders));
}
