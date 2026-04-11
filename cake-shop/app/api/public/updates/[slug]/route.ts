import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Update } from "@/lib/models/Update";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const update = await Update.findOne({ slug, isPublished: true });

    if (!update) {
      return NextResponse.json(
        { success: false, message: "Update not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, update });
  } catch (error) {
    console.error("Get update error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
