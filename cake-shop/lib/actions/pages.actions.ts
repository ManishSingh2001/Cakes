"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { CustomPage } from "@/lib/models/CustomPage";
import { customPageSchema } from "@/lib/validations/content.schema";

export async function createPage(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = customPageSchema.parse(data);
  await connectDB();
  await CustomPage.create({
    ...validated,
    author: session.user.id,
    publishedAt: validated.isPublished ? new Date() : undefined,
  });
  revalidatePath("/admin/pages");
  return { success: true };
}

export async function updatePage(id: string, data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = customPageSchema.parse(data);
  await connectDB();
  await CustomPage.findByIdAndUpdate(id, validated);
  revalidatePath("/admin/pages");
  revalidatePath(`/${validated.slug}`);
  return { success: true };
}

export async function deletePage(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  await CustomPage.findByIdAndDelete(id);
  revalidatePath("/admin/pages");
  return { success: true };
}
