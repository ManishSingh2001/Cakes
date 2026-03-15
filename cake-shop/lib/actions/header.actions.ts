"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Header } from "@/lib/models/Header";
import { headerSchema } from "@/lib/validations/header.schema";

export async function updateHeader(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = headerSchema.parse(data);
  await connectDB();
  await Header.findOneAndUpdate({}, validated, { upsert: true, new: true });
  revalidatePath("/");
  return { success: true };
}
