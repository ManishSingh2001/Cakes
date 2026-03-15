"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Visit } from "@/lib/models/Visit";
import { visitSchema } from "@/lib/validations/content.schema";

export async function updateVisit(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = visitSchema.parse(data);
  await connectDB();
  await Visit.findOneAndUpdate({}, validated, { upsert: true, new: true });
  revalidatePath("/contact");
  revalidatePath("/");
  return { success: true };
}
