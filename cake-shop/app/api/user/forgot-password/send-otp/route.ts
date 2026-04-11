import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Otp } from "@/lib/models/Otp";
import { sendOtpEmail } from "@/lib/mailer";

const schema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = schema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email" },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists
      return NextResponse.json({
        success: true,
        message: "If this email is registered, you will receive an OTP",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    await sendOtpEmail(email, otp);

    return NextResponse.json({
      success: true,
      message: "If this email is registered, you will receive an OTP",
    });
  } catch (error) {
    console.error("Forgot password send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
