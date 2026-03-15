import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Header } from "@/lib/models/Header";
import { Hero } from "@/lib/models/Hero";
import { About } from "@/lib/models/About";
import { Footer } from "@/lib/models/Footer";
import { Visit } from "@/lib/models/Visit";
import { SiteSettings } from "@/lib/models/SiteSettings";

export async function GET() {
  try {
    await connectDB();

    const [header, hero, about, footer, visit, settings] = await Promise.all([
      Header.findOne(),
      Hero.findOne(),
      About.findOne(),
      Footer.findOne(),
      Visit.findOne(),
      SiteSettings.findOne(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        header,
        hero,
        about,
        footer,
        visit,
        settings,
      },
    });
  } catch (error) {
    console.error("Get content error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
