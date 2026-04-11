import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Cake } from "@/lib/models/Cake";
import { Addon } from "@/lib/models/Addon";
import { cakeSchema } from "@/lib/validations/cake.schema";
import { addonSchema } from "@/lib/validations/addon.schema";
import { slugify, generateSku } from "@/lib/utils";

function parseBoolean(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val === 1;
  const s = String(val).toLowerCase().trim();
  return s === "true" || s === "yes" || s === "1";
}

function processCakeRows(rows: Record<string, unknown>[]) {
  const grouped = new Map<
    string,
    { firstRow: number; data: Record<string, unknown>; prices: { weight: number; costPrice: number; sellPrice: number }[] }
  >();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row.name || "").trim();
    if (!name) continue;

    const price = {
      weight: Number(row.weight) || 0,
      costPrice: Number(row.costPrice) || 0,
      sellPrice: Number(row.sellPrice) || 0,
    };

    if (grouped.has(name)) {
      grouped.get(name)!.prices.push(price);
    } else {
      const tags = row.tags
        ? String(row.tags).split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      grouped.set(name, {
        firstRow: i + 2, // Excel row (1-indexed header + 1)
        data: {
          sku: String(row.sku || "").trim().toUpperCase() || generateSku(String(row.caketype || "cake"), String(row.category || "")),
          name,
          slug: String(row.slug || "").trim() || slugify(name),
          description: String(row.description || ""),
          caketype: String(row.caketype || "cake").toLowerCase(),
          type: String(row.type || "eggless").toLowerCase(),
          category: String(row.category || ""),
          tags,
          isFeatured: parseBoolean(row.isFeatured),
          isAvailable: row.isAvailable !== undefined ? parseBoolean(row.isAvailable) : true,
          images: row.imageUrl ? [{ url: String(row.imageUrl), alt: String(row.imageAlt || "") }] : [],
        },
        prices: [price],
      });
    }
  }

  return grouped;
}

function processAddonRows(rows: Record<string, unknown>[]) {
  return rows.map((row, i) => {
    const name = String(row.name || "").trim();
    return {
      row: i + 2,
      data: {
        name,
        slug: String(row.slug || "").trim() || slugify(name),
        description: String(row.description || ""),
        category: String(row.category || "extras").toLowerCase(),
        image: String(row.image || ""),
        price: Number(row.price) || 0,
        stock: Number(row.stock) || 0,
        isAvailable: row.isAvailable !== undefined ? parseBoolean(row.isAvailable) : true,
      },
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }
    if (!["cakes", "addons"].includes(type)) {
      return NextResponse.json({ success: false, message: "Type must be 'cakes' or 'addons'" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Excel file is empty" }, { status: 400 });
    }

    await connectDB();

    const errors: { row: number; name: string; errors: string[] }[] = [];
    let created = 0;

    if (type === "cakes") {
      const grouped = processCakeRows(rows);
      const validCakes: Record<string, unknown>[] = [];

      for (const [name, entry] of grouped) {
        const record = { ...entry.data, prices: entry.prices };
        const result = cakeSchema.safeParse(record);

        if (!result.success) {
          const msgs = Object.entries(result.error.flatten().fieldErrors)
            .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
            .concat(result.error.flatten().formErrors);
          errors.push({ row: entry.firstRow, name, errors: msgs });
        } else {
          validCakes.push(result.data);
        }
      }

      if (validCakes.length > 0) {
        try {
          const result = await Cake.insertMany(validCakes, { ordered: false });
          created = result.length;
        } catch (err: unknown) {
          const bulkErr = err as { writeErrors?: { index: number; errmsg: string }[] };
          if (bulkErr.writeErrors) {
            const validEntries = Array.from(grouped.values());
            for (const we of bulkErr.writeErrors) {
              const entry = validEntries[we.index];
              errors.push({
                row: entry?.firstRow || 0,
                name: String((validCakes[we.index] as Record<string, unknown>)?.name || ""),
                errors: [we.errmsg.includes("duplicate") ? "Duplicate slug already exists" : we.errmsg],
              });
            }
            created = validCakes.length - bulkErr.writeErrors.length;
          }
        }
      }

      return NextResponse.json({
        success: true,
        summary: { total: grouped.size, created, failed: grouped.size - created },
        errors,
      });
    } else {
      // Addons
      const processed = processAddonRows(rows);
      const validAddons: Record<string, unknown>[] = [];
      const validRows: typeof processed = [];

      for (const item of processed) {
        const result = addonSchema.safeParse(item.data);
        if (!result.success) {
          const msgs = Object.entries(result.error.flatten().fieldErrors)
            .map(([field, errs]) => `${field}: ${(errs as string[]).join(", ")}`)
            .concat(result.error.flatten().formErrors);
          errors.push({ row: item.row, name: String(item.data.name), errors: msgs });
        } else {
          validAddons.push(result.data);
          validRows.push(item);
        }
      }

      if (validAddons.length > 0) {
        try {
          const result = await Addon.insertMany(validAddons, { ordered: false });
          created = result.length;
        } catch (err: unknown) {
          const bulkErr = err as { writeErrors?: { index: number; errmsg: string }[] };
          if (bulkErr.writeErrors) {
            for (const we of bulkErr.writeErrors) {
              const item = validRows[we.index];
              errors.push({
                row: item?.row || 0,
                name: String((validAddons[we.index] as Record<string, unknown>)?.name || ""),
                errors: [we.errmsg.includes("duplicate") ? "Duplicate slug already exists" : we.errmsg],
              });
            }
            created = validAddons.length - bulkErr.writeErrors.length;
          }
        }
      }

      return NextResponse.json({
        success: true,
        summary: { total: processed.length, created, failed: processed.length - created },
        errors,
      });
    }
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process file" },
      { status: 500 }
    );
  }
}
