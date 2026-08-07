import { NextRequest } from "next/server";
import { db } from "@/db";
import { resellerStores, resellerPrices, products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAuth();

    const [store] = await db
      .select()
      .from(resellerStores)
      .where(eq(resellerStores.userId, session.userId))
      .limit(1);

    if (!store) return error("No reseller store found", 404);

    // Get custom prices
    const customPrices = await db
      .select({
        id: resellerPrices.id,
        productId: resellerPrices.productId,
        customPrice: resellerPrices.customPrice,
        productName: products.name,
        defaultPrice: products.price,
        dataAmount: products.dataAmount,
        network: products.network,
      })
      .from(resellerPrices)
      .leftJoin(products, eq(resellerPrices.productId, products.id))
      .where(eq(resellerPrices.resellerStoreId, store.id));

    return success({ store, customPrices });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const [store] = await db
      .select()
      .from(resellerStores)
      .where(eq(resellerStores.userId, session.userId))
      .limit(1);

    if (!store) return error("No reseller store found", 404);

    // Update store details
    const { storeName, description, whatsappNumber, logoUrl } = body;
    const updates: Record<string, unknown> = {};
    if (storeName) updates.storeName = storeName;
    if (description !== undefined) updates.description = description;
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber;
    if (logoUrl !== undefined) updates.logoUrl = logoUrl;

    if (Object.keys(updates).length > 0) {
      const [updated] = await db
        .update(resellerStores)
        .set(updates)
        .where(eq(resellerStores.id, store.id))
        .returning();

      return success({ store: updated });
    }

    return success({ store });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { productId, customPrice } = await req.json();

    if (!productId || !customPrice) return error("Product ID and price required");

    const [store] = await db
      .select()
      .from(resellerStores)
      .where(eq(resellerStores.userId, session.userId))
      .limit(1);

    if (!store) return error("No reseller store found", 404);

    // Upsert custom price
    const [existing] = await db
      .select()
      .from(resellerPrices)
      .where(
        and(
          eq(resellerPrices.resellerStoreId, store.id),
          eq(resellerPrices.productId, productId)
        )
      )
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(resellerPrices)
        .set({ customPrice: String(customPrice) })
        .where(eq(resellerPrices.id, existing.id))
        .returning();
      return success({ price: updated });
    } else {
      const [created] = await db
        .insert(resellerPrices)
        .values({
          resellerStoreId: store.id,
          productId,
          customPrice: String(customPrice),
        })
        .returning();
      return success({ price: created });
    }
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
