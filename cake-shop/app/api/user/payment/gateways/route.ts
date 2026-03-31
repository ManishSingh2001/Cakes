import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/lib/models/SiteSettings";

export async function GET() {
  try {
    await connectDB();
    const settings = await SiteSettings.findOne().lean();

    const pg = settings?.paymentGateways;

    const gateways: {
      id: string;
      displayName: string;
      instructions?: string;
      accountDetails?: string;
    }[] = [];

    if (pg?.razorpay?.enabled) {
      gateways.push({
        id: "razorpay",
        displayName: pg.razorpay.displayName || "Razorpay",
      });
    }

    if (pg?.stripe?.enabled) {
      gateways.push({
        id: "stripe",
        displayName: pg.stripe.displayName || "Stripe",
      });
    }

    if (pg?.cod?.enabled) {
      gateways.push({
        id: "cod",
        displayName: pg.cod.displayName || "Cash on Delivery",
        instructions: pg.cod.instructions,
      });
    }

    if (pg?.bankTransfer?.enabled) {
      gateways.push({
        id: "bank_transfer",
        displayName: pg.bankTransfer.displayName || "Bank Transfer",
        instructions: pg.bankTransfer.instructions,
        accountDetails: pg.bankTransfer.accountDetails,
      });
    }

    // If no gateways configured, default to Razorpay
    if (gateways.length === 0) {
      gateways.push({ id: "razorpay", displayName: "Razorpay" });
    }

    return NextResponse.json({ success: true, gateways });
  } catch (error) {
    console.error("Get gateways error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
