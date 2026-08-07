import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, resellerStores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { success, error } from "@/lib/api-response";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { storeName, description, whatsappNumber } = await req.json();

    if (!storeName) return error("Store name is required");

    // Check if already has a store
    const [existing] = await db
      .select()
      .from(resellerStores)
      .where(eq(resellerStores.userId, session.userId))
      .limit(1);

    if (existing) {
      return error("You already have a reseller store");
    }

    const storeSlug = slugify(storeName) + "-" + Date.now().toString(36);

    // Update user role to indicate reseller application
    await db
      .update(users)
      .set({ role: "reseller", updatedAt: new Date() })
      .where(eq(users.id, session.userId));

    // Auto-approve for now (admin can deactivate later)
    const [store] = await db
      .insert(resellerStores)
      .values({
        userId: session.userId,
        storeName,
        storeSlug,
        description: description || "",
        whatsappNumber: whatsappNumber || "",
      })
      .returning();

    return success({
      store,
      message: "Your reseller store has been created!",
    });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
