"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { About } from "@/lib/models/About";
import { aboutSchema } from "@/lib/validations/content.schema";

export async function updateAbout(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = aboutSchema.parse(data);
  await connectDB();
  await About.findOneAndUpdate({}, validated, { upsert: true, new: true });
  revalidatePath("/about");
  return { success: true };
}
