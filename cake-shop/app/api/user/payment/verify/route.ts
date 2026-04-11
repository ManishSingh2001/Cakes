import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { Cart } from "@/lib/models/Cart";
import { User } from "@/lib/models/User";
import { SiteSettings } from "@/lib/models/SiteSettings";
import { sendOrderConfirmationEmail, sendAdminOrderAlertEmail } from "@/lib/mailer";

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

    const body = await request.json();
    const { orderId, gateway } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // --- RAZORPAY VERIFICATION ---
    if (gateway === "razorpay") {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { success: false, message: "All Razorpay payment fields are required" },
          { status: 400 }
        );
      }

      // Get key secret from settings or env
      const settings = await SiteSettings.findOne().lean();
      const keySecret =
        settings?.paymentGateways?.razorpay?.keySecret ||
        process.env.RAZORPAY_KEY_SECRET!;

      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

      if (expectedSignature !== razorpay_signature) {
        await Order.findByIdAndUpdate(orderId, {
          "payment.status": "failed",
        });
        return NextResponse.json(
          { success: false, message: "Payment verification failed" },
          { status: 400 }
        );
      }

      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          "payment.status": "paid",
          "payment.razorpayPaymentId": razorpay_payment_id,
          "payment.razorpaySignature": razorpay_signature,
          "payment.paidAt": new Date(),
          orderStatus: "confirmed",
          $push: {
            statusHistory: {
              status: "confirmed",
              changedAt: new Date(),
              note: "Payment verified",
            },
          },
        },
        { returnDocument: "after" }
      );

      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      // Clear cart
      await Cart.findOneAndUpdate(
        { userId: session.user.id },
        { $set: { items: [], totalAmount: 0 } }
      );

      // Send order emails (non-blocking)
      const user = await User.findById(session.user.id).lean();
      if (user?.email) {
        sendOrderConfirmationEmail(order, user.email).catch(() => {});
        sendAdminOrderAlertEmail(order, user.email).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    // --- STRIPE VERIFICATION ---
    if (gateway === "stripe") {
      const { paymentIntentId } = body;

      try {
        const settings = await SiteSettings.findOne().lean();
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(
          settings?.paymentGateways?.stripe?.secretKey ||
            process.env.STRIPE_SECRET_KEY ||
            ""
        );

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status === "succeeded") {
          const order = await Order.findByIdAndUpdate(
            orderId,
            {
              "payment.status": "paid",
              "payment.paidAt": new Date(),
              orderStatus: "confirmed",
              $push: {
                statusHistory: {
                  status: "confirmed",
                  changedAt: new Date(),
                  note: "Stripe payment verified",
                },
              },
            },
            { returnDocument: "after" }
          );

          if (!order) {
            return NextResponse.json(
              { success: false, message: "Order not found" },
              { status: 404 }
            );
          }

          await Cart.findOneAndUpdate(
            { userId: session.user.id },
            { $set: { items: [], totalAmount: 0 } }
          );

          // Send order emails (non-blocking)
          const stripeUser = await User.findById(session.user.id).lean();
          if (stripeUser?.email) {
            sendOrderConfirmationEmail(order, stripeUser.email).catch(() => {});
            sendAdminOrderAlertEmail(order, stripeUser.email).catch(() => {});
          }

          return NextResponse.json({
            success: true,
            message: "Stripe payment verified",
          });
        }

        return NextResponse.json(
          { success: false, message: "Payment not completed" },
          { status: 400 }
        );
      } catch (err) {
        console.error("Stripe verify error:", err);
        return NextResponse.json(
          { success: false, message: "Stripe verification failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Unknown payment gateway" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
