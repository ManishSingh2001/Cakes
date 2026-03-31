import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    // Try finding by MongoDB _id first, then by orderId
    let order = await Order.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!order) {
      order = await Order.findOne({
        orderId: id,
        userId: session.user.id,
      }).lean();
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: JSON.parse(JSON.stringify(order)),
    });
  } catch (error) {
    console.error("Get order detail error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
