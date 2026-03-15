"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";

export async function updateOrderStatus(
  orderId: string,
  orderStatus: string,
  note: string = ""
) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  await Order.findOneAndUpdate(
    { orderId },
    {
      orderStatus,
      $push: {
        statusHistory: {
          status: orderStatus,
          changedAt: new Date(),
          changedBy: session.user.id,
          note,
        },
      },
    }
  );

  revalidatePath("/admin/orders");
  return { success: true };
}
