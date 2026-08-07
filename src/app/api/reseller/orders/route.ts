import { db } from "@/db";
import { orders, products, users, resellerStores } from "@/db/schema";
import { eq } from "drizzle-orm";
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

    const storeOrders = await db
      .select({
        id: orders.id,
        phoneNumber: orders.phoneNumber,
        network: orders.network,
        amount: orders.amount,
        profit: orders.profit,
        status: orders.status,
        isGuest: orders.isGuest,
        createdAt: orders.createdAt,
        productName: products.name,
        dataAmount: products.dataAmount,
        validity: products.validity,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        userWhatsapp: users.whatsappNumber,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .leftJoin(users, eq(orders.userId, users.id))
      .where(eq(orders.resellerStoreId, store.id));

    return success({ orders: storeOrders });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
