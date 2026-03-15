"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Addon } from "@/lib/models/Addon";
import { addonSchema } from "@/lib/validations/addon.schema";

export async function createAddon(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = addonSchema.parse(data);
  await connectDB();
  await Addon.create(validated);
  revalidatePath("/admin/addons");
  return { success: true };
}

export async function updateAddon(id: string, data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = addonSchema.parse(data);
  await connectDB();
  await Addon.findByIdAndUpdate(id, validated);
  revalidatePath("/admin/addons");
  return { success: true };
}

export async function deleteAddon(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  await Addon.findByIdAndDelete(id);
  revalidatePath("/admin/addons");
  return { success: true };
}
