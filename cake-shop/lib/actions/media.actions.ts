"use server";

import { revalidatePath } from "next/cache";
import { UTApi } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Media } from "@/lib/models/Media";

const utapi = new UTApi();

export async function deleteMedia(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  const media = await Media.findByIdAndDelete(id);

  if (media?.uploadthingKey) {
    try {
      await utapi.deleteFiles(media.uploadthingKey);
    } catch (err) {
      console.error("Failed to delete from UploadThing:", err);
    }
  }

  revalidatePath("/admin/media");
  revalidatePath("/gallery");
  return { success: true };
}
