"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Hero } from "@/lib/models/Hero";
import { heroSchema } from "@/lib/validations/hero.schema";

export async function updateHero(data: unknown) {
  const session = await auth();
  if (!session || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    throw new Error("Unauthorized");
  }

  const validated = heroSchema.parse(data);
  await connectDB();
  await Hero.findOneAndUpdate({}, validated, { upsert: true, new: true });
  revalidatePath("/");
  return { success: true };
}
