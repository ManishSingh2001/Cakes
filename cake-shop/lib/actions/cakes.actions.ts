"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";
import { cakeSchema } from "@/lib/validations/cake.schema";

export async function createCake(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = cakeSchema.parse(data);
  await connectDB();
  await Cake.create(validated);
  revalidatePath("/menu");
  revalidatePath("/admin/cakes");
  return { success: true };
}

export async function updateCake(id: string, data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = cakeSchema.parse(data);
  await connectDB();
  await Cake.findByIdAndUpdate(id, validated);
  revalidatePath("/menu");
  revalidatePath("/admin/cakes");
  return { success: true };
}

export async function deleteCake(id: string) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  await connectDB();
  await Cake.findByIdAndDelete(id);
  revalidatePath("/menu");
  revalidatePath("/admin/cakes");
  return { success: true };
}
