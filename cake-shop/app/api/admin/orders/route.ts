import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { orderStatusUpdateSchema } from "@/lib/validations/order.schema";

export async function GET() {
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

    await connectDB();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email");

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { orderId, ...statusData } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    const validation = orderStatusUpdateSchema.safeParse(statusData);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orderStatus, note } = validation.data;

    await connectDB();
    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        orderStatus,
        $push: {
          statusHistory: {
            status: orderStatus,
            changedAt: new Date(),
            changedBy: session.user.id,
            note: note || "",
          },
        },
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Admin orders PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
