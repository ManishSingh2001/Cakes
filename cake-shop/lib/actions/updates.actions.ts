"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Update } from "@/lib/models/Update";
import { updateSchema } from "@/lib/validations/content.schema";

export async function createUpdate(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = updateSchema.parse(data);
  await connectDB();
  await Update.create({
    ...validated,
    author: session.user.id,
    publishedAt: validated.isPublished ? new Date() : undefined,
  });
  revalidatePath("/admin/updates");
  revalidatePath("/");
  return { success: true };
}

export async function updateUpdatePost(id: string, data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = updateSchema.parse(data);
  await connectDB();
  await Update.findByIdAndUpdate(id, {
    ...validated,
    publishedAt: validated.isPublished ? new Date() : undefined,
  });
  revalidatePath("/admin/updates");
  revalidatePath("/");
  return { success: true };
}

export async function deleteUpdate(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  await Update.findByIdAndDelete(id);
  revalidatePath("/admin/updates");
  revalidatePath("/");
  return { success: true };
}
