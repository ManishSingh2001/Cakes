"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Footer } from "@/lib/models/Footer";
import { footerSchema } from "@/lib/validations/content.schema";

export async function updateFooter(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = footerSchema.parse(data);
  await connectDB();
  await Footer.findOneAndUpdate({}, validated, { upsert: true, new: true });
  revalidatePath("/");
  return { success: true };
}
