"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";

export async function deleteMedia(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  await Media.findByIdAndDelete(id);
  revalidatePath("/admin/media");
  revalidatePath("/gallery");
  return { success: true };
}
