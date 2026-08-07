import { db } from "@/db";
import { resellerCustomers, resellerStores, users } from "@/db/schema";
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

    const customers = await db
      .select({
        id: resellerCustomers.id,
        phone: resellerCustomers.phone,
        whatsappNumber: resellerCustomers.whatsappNumber,
        totalOrders: resellerCustomers.totalOrders,
        totalSpent: resellerCustomers.totalSpent,
        createdAt: resellerCustomers.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(resellerCustomers)
      .leftJoin(users, eq(resellerCustomers.userId, users.id))
      .where(eq(resellerCustomers.resellerStoreId, store.id));

    return success({ customers });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
