import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { createRazorpayClient } from "@/lib/razorpay";
import { generateOrderId } from "@/lib/utils";
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from "@/lib/mailer";

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

    const {
      deliveryAddress,
      deliveryDate,
      deliverySlot,
      specialInstructions,
      paymentMethod,
    } = await request.json();

    if (!deliveryAddress || !deliveryDate || !deliverySlot) {
      return NextResponse.json(
        { success: false, message: "Delivery address, date, and slot are required" },
        { status: 400 }
      );
    }

    const method = paymentMethod || "razorpay";

    // Validate gateway is enabled
    const settings = await SiteSettings.findOne().lean();
    const pg = settings?.paymentGateways;

    const gatewayEnabled =
      (method === "razorpay" && (pg?.razorpay?.enabled !== false)) ||
      (method === "stripe" && pg?.stripe?.enabled) ||
      (method === "cod" && pg?.cod?.enabled) ||
      (method === "bank_transfer" && pg?.bankTransfer?.enabled);

    if (!gatewayEnabled) {
      return NextResponse.json(
        { success: false, message: "Selected payment method is not available" },
        { status: 400 }
      );
    }

    // Get cart
    const cart = await Cart.findOne({ userId: session.user.id });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty" },
        { status: 400 }
      );
    }

    const subtotal = cart.totalAmount;
    const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const totalAmount = subtotal + deliveryCharge;

    // Map cart items to order items with itemTotal
    const orderItems = cart.items.map((item: Record<string, unknown>) => {
      const priceOption = item.priceOption as { weight: number; sellPrice: number };
      const quantity = item.quantity as number;
      const addons = (item.addons as Array<{ addonId: string; name: string; price: number; quantity: number }>) || [];
      const addonsTotal = addons.reduce((sum, a) => sum + a.price * a.quantity, 0);
      const itemTotal = priceOption.sellPrice * quantity + addonsTotal;

      return {
        cakeId: item.cakeId,
        sku: item.sku || "",
        name: item.name,
        image: item.image || "",
        priceOption,
        quantity,
        cakeMessage: item.cakeMessage || "",
        addons,
        itemTotal,
      };
    });

    const orderData: Record<string, unknown> = {
      orderId: generateOrderId(),
      userId: session.user.id,
      items: orderItems,
      subtotal,
      deliveryCharge,
      discount: 0,
      totalAmount,
      deliveryAddress,
      deliveryDate: new Date(deliveryDate),
      deliverySlot,
      specialInstructions: specialInstructions || "",
      payment: {
        method,
        status: "pending",
      },
      orderStatus: "placed",
      statusHistory: [{ status: "placed", changedAt: new Date() }],
    };

    // --- RAZORPAY ---
    if (method === "razorpay") {
      const rpClient = createRazorpayClient(
        pg?.razorpay?.keyId || undefined,
        pg?.razorpay?.keySecret || undefined
      );

      const razorpayOrder = await rpClient.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: orderData.orderId as string,
      });

      orderData.payment = {
        method: "razorpay",
        status: "pending",
        razorpayOrderId: razorpayOrder.id,
      };

      const order = await Order.create(orderData);

      return NextResponse.json({
        success: true,
        gateway: "razorpay",
        orderId: order._id,
        orderNumber: order.orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        key: pg?.razorpay?.keyId || process.env.RAZORPAY_KEY_ID,
      });
    }

    // --- STRIPE ---
    if (method === "stripe") {
      // Stripe requires the stripe npm package. For now, create order and return clientSecret placeholder.
      // Full Stripe integration requires: npm install stripe
      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(
          pg?.stripe?.secretKey || process.env.STRIPE_SECRET_KEY || "",
        );

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(totalAmount * 100),
          currency: "inr",
          metadata: { orderId: orderData.orderId as string },
        });

        orderData.payment = {
          method: "stripe",
          status: "pending",
          stripePaymentIntentId: paymentIntent.id,
        };

        const order = await Order.create(orderData);

        return NextResponse.json({
          success: true,
          gateway: "stripe",
          orderId: order._id,
          orderNumber: order.orderId,
          clientSecret: paymentIntent.client_secret,
          publishableKey: pg?.stripe?.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        });
      } catch (err) {
        console.error("Stripe error:", err);
        return NextResponse.json(
          { success: false, message: "Stripe payment failed. Please try another method." },
          { status: 500 }
        );
      }
    }

    // --- COD ---
    if (method === "cod") {
      orderData.payment = {
        method: "cod",
        status: "pending",
      };

      const order = await Order.create(orderData);

      // Clear cart
      await Cart.findOneAndUpdate(
        { userId: session.user.id },
        { $set: { items: [], totalAmount: 0 } }
      );

      // Send order emails (non-blocking)
      const codUser = await User.findById(session.user.id).lean();
      if (codUser?.email) {
        sendOrderConfirmationEmail(order, codUser.email).catch(() => {});
        sendAdminOrderAlertEmail(order, codUser.email).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        gateway: "cod",
        orderId: order._id,
        orderNumber: order.orderId,
        message: "Order placed successfully! Pay on delivery.",
      });
    }

    // --- BANK TRANSFER ---
    if (method === "bank_transfer") {
      orderData.payment = {
        method: "bank_transfer",
        status: "pending",
      };

      const order = await Order.create(orderData);

      // Clear cart
      await Cart.findOneAndUpdate(
        { userId: session.user.id },
        { $set: { items: [], totalAmount: 0 } }
      );

      // Send order emails (non-blocking)
      const btUser = await User.findById(session.user.id).lean();
      if (btUser?.email) {
        sendOrderConfirmationEmail(order, btUser.email).catch(() => {});
        sendAdminOrderAlertEmail(order, btUser.email).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        gateway: "bank_transfer",
        orderId: order._id,
        orderNumber: order.orderId,
        message: "Order placed! Please transfer the amount.",
        accountDetails: pg?.bankTransfer?.accountDetails || "",
        instructions: pg?.bankTransfer?.instructions || "",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid payment method" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
