import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { Order } from "@/lib/models/Order";
import { razorpay } from "@/lib/razorpay";

const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 50;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { deliveryAddress, deliveryDate, deliverySlot, specialInstructions } =
      await request.json();

    if (!deliveryAddress || !deliveryDate || !deliverySlot) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Delivery address, date, and slot are required",
        },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ user: session.user.id }).populate(
      "items.cake"
    );

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    const subtotal = cart.totalAmount;
    const deliveryCharge =
      subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const totalAmount = subtotal + deliveryCharge;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
    });

    const order = await Order.create({
      user: session.user.id,
      items: cart.items.map(
        (item: {
          cake: { _id: string };
          priceOption: unknown;
          price: number;
          quantity: number;
          cakeMessage: string;
          addons: unknown[];
        }) => ({
          cake: item.cake._id,
          priceOption: item.priceOption,
          price: item.price,
          quantity: item.quantity,
          cakeMessage: item.cakeMessage,
          addons: item.addons,
        })
      ),
      subtotal,
      deliveryCharge,
      totalAmount,
      deliveryAddress,
      deliveryDate: new Date(deliveryDate),
      deliverySlot,
      specialInstructions: specialInstructions || "",
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    return NextResponse.json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
    });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
