import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const { orderId, paymentStatus } = await request.json();

    if (!orderId || !["paid", "failed", "refunded"].includes(paymentStatus)) {
      return NextResponse.json(
        { success: false, message: "Valid orderId and paymentStatus required" },
        { status: 400 }
      );
    }

    await connectDB();

    const update: Record<string, unknown> = {
      "payment.status": paymentStatus,
    };

    if (paymentStatus === "paid") {
      update["payment.paidAt"] = new Date();
    }

    const order = await Order.findByIdAndUpdate(orderId, update, {
      returnDocument: "after",
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Admin payment update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
