import { NextRequest } from "next/server";
import { db } from "@/db";
import { providers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const allProviders = await db.select().from(providers);
    return success({ providers: allProviders });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const [provider] = await db.insert(providers).values(body).returning();
    return success({ provider }, 201);
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { id, ...updates } = await req.json();
    if (!id) return error("Provider ID required");

    const [updated] = await db
      .update(providers)
      .set(updates)
      .where(eq(providers.id, id))
      .returning();
    return success({ provider: updated });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    const { id } = await req.json();
    if (!id) return error("Provider ID required");

    await db.delete(providers).where(eq(providers.id, id));
    return success({ message: "Provider deleted" });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
