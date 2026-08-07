import { NextRequest } from "next/server";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const [settings] = await db.select().from(siteSettings).limit(1);
    return success({ settings });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Admin settings GET error:", err);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const [existing] = await db.select().from(siteSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ ...body, updatedAt: new Date() })
        .returning();
      return success({ settings: updated });
    } else {
      const [created] = await db.insert(siteSettings).values(body).returning();
      return success({ settings: created });
    }
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Admin settings PUT error:", err);
    return error("Internal server error", 500);
  }
}
