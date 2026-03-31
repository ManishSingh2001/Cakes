import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const caketype = searchParams.get("caketype");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const cursor = searchParams.get("cursor"); // _id of last item
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50);

    const filter: Record<string, unknown> = { isAvailable: true };

    if (caketype) filter.caketype = caketype;
    if (type) filter.type = type;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Cursor pagination: fetch items after the cursor
    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const cakes = await Cake.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1) // fetch one extra to check hasMore
      .lean();

    const hasMore = cakes.length > limit;
    if (hasMore) cakes.pop();

    const nextCursor = cakes.length > 0 ? cakes[cakes.length - 1]._id : null;

    // Total count for display (only on first page)
    const total = !cursor ? await Cake.countDocuments(filter) : undefined;

    return NextResponse.json({
      success: true,
      cakes: JSON.parse(JSON.stringify(cakes)),
      pagination: {
        nextCursor,
        hasMore,
        ...(total !== undefined && { total }),
      },
    });
  } catch (error) {
    console.error("Get cakes error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
