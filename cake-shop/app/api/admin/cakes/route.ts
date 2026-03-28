import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";
import { cakeSchema } from "@/lib/validations/cake.schema";

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
    const cakes = await Cake.find().sort({ order: 1, createdAt: 1 });

    return NextResponse.json({ success: true, data: cakes });
  } catch (error) {
    console.error("Admin cakes GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validation = cakeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();
    const cake = await Cake.create(validation.data);

    return NextResponse.json({ success: true, data: cake }, { status: 201 });
  } catch (error) {
    console.error("Admin cakes POST error:", error);
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
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Cake _id is required" },
        { status: 400 }
      );
    }

    const validation = cakeSchema.partial().safeParse(updateData);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();
    const cake = await Cake.findByIdAndUpdate(
      _id,
      validation.data,
      { returnDocument: "after", runValidators: true }
    );

    if (!cake) {
      return NextResponse.json(
        { success: false, message: "Cake not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: cake });
  } catch (error) {
    console.error("Admin cakes PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const _id = searchParams.get("_id");

    if (!_id) {
      return NextResponse.json(
        { success: false, message: "Cake _id is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const cake = await Cake.findByIdAndDelete(_id);

    if (!cake) {
      return NextResponse.json(
        { success: false, message: "Cake not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Cake deleted successfully" });
  } catch (error) {
    console.error("Admin cakes DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
