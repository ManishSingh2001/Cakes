import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";

export async function GET(request: NextRequest) {
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
    const folder = searchParams.get("folder");

    await connectDB();

    const filter: Record<string, string> = {};
    if (folder) {
      filter.folder = folder;
    }

    const media = await Media.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: media });
  } catch (error) {
    console.error("Admin media GET error:", error);
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    const folder = (formData.get("folder") as string) || "general";
    const alt = (formData.get("alt") as string) || "";

    // Save file metadata to DB (actual file storage to be implemented)
    await connectDB();
    const media = await Media.create({
      filename: file.name,
      url: `/uploads/${folder}/${file.name}`,
      thumbnailUrl: "",
      mimeType: file.type,
      size: file.size,
      alt,
      folder,
      uploadedBy: session.user.id,
    });

    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    console.error("Admin media POST error:", error);
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
        { success: false, message: "Media _id is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const media = await Media.findByIdAndDelete(_id);

    if (!media) {
      return NextResponse.json(
        { success: false, message: "Media not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    console.error("Admin media DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
