import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { CustomPage } from "@/lib/models/CustomPage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const page = await CustomPage.findOne({ slug, isPublished: true });

    if (!page) {
      return NextResponse.json(
        { success: false, message: "Page not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error("Get page error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
