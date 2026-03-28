import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Footer } from "@/lib/models/Footer";
import { footerSchema } from "@/lib/validations/content.schema";

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
    const footer = await Footer.findOne();

    return NextResponse.json({ success: true, data: footer });
  } catch (error) {
    console.error("Admin footer GET error:", error);
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
    const validation = footerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();
    const footer = await Footer.findOneAndUpdate(
      {},
      validation.data,
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: footer });
  } catch (error) {
    console.error("Admin footer PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
