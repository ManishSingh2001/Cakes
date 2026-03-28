import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id)
      .select("wishlist")
      .populate("wishlist");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { cakeId } = await request.json();
    if (!cakeId) {
      return NextResponse.json(
        { success: false, message: "Cake ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.wishlist.includes(cakeId)) {
      return NextResponse.json(
        { success: false, message: "Cake already in wishlist" },
        { status: 400 }
      );
    }

    user.wishlist.push(cakeId);
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Cake added to wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const { cakeId } = await request.json();
    if (!cakeId) {
      return NextResponse.json(
        { success: false, message: "Cake ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $pull: { wishlist: cakeId } },
      { returnDocument: "after" }
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cake removed from wishlist",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
