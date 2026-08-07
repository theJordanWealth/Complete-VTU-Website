import { NextRequest } from "next/server";
import { db } from "@/db";
import { resellerStores, resellerPrices, products, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const [store] = await db
      .select()
      .from(resellerStores)
      .where(and(eq(resellerStores.storeSlug, slug), eq(resellerStores.isActive, true)))
      .limit(1);

    if (!store) return error("Store not found", 404);

    // Get store owner info
    const [owner] = await db
      .select({ name: users.name })
      .from(users)
      .where(eq(users.id, store.userId))
      .limit(1);

    // Get active products with custom prices
    const activeProducts = await db
      .select()
      .from(products)
      .where(eq(products.isActive, true));

    const customPrices = await db
      .select()
      .from(resellerPrices)
      .where(eq(resellerPrices.resellerStoreId, store.id));

    const priceMap = new Map(
      customPrices.map((cp) => [cp.productId, cp.customPrice])
    );

    const storeProducts = activeProducts.map((p) => ({
      ...p,
      price: priceMap.get(p.id) || p.price,
      originalPrice: p.price,
    }));

    return success({
      store: {
        ...store,
        ownerName: owner?.name,
      },
      products: storeProducts,
    });
  } catch (err) {
    console.error("Store fetch error:", err);
    return error("Internal server error", 500);
  }
}
