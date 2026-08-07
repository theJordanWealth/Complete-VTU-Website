import { NextRequest } from "next/server";
import { db } from "@/db";
import { resellerStores, users, orders, resellerWithdrawals, resellerCustomers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();

    const stores = await db
      .select({
        id: resellerStores.id,
        userId: resellerStores.userId,
        storeName: resellerStores.storeName,
        storeSlug: resellerStores.storeSlug,
        whatsappNumber: resellerStores.whatsappNumber,
        isActive: resellerStores.isActive,
        createdAt: resellerStores.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(resellerStores)
      .leftJoin(users, eq(resellerStores.userId, users.id));

    // Get stats for each store
    const storeStats = await Promise.all(
      stores.map(async (store) => {
        const [orderStats] = await db
          .select({
            totalOrders: sql<number>`count(*)::int`,
            totalRevenue: sql<string>`coalesce(sum(${orders.amount}), 0)`,
            totalProfit: sql<string>`coalesce(sum(${orders.profit}), 0)`,
          })
          .from(orders)
          .where(eq(orders.resellerStoreId, store.id));

        const [pendingWithdrawals] = await db
          .select({ total: sql<string>`coalesce(sum(${resellerWithdrawals.amount}), 0)` })
          .from(resellerWithdrawals)
          .where(
            and(
              eq(resellerWithdrawals.resellerStoreId, store.id),
              eq(resellerWithdrawals.status, "pending")
            )
          );

        const [customerCount] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(resellerCustomers)
          .where(eq(resellerCustomers.resellerStoreId, store.id));

        return {
          ...store,
          stats: {
            totalOrders: orderStats?.totalOrders || 0,
            totalRevenue: orderStats?.totalRevenue || "0",
            totalProfit: orderStats?.totalProfit || "0",
            pendingWithdrawals: pendingWithdrawals?.total || "0",
            customerCount: customerCount?.count || 0,
          },
        };
      })
    );

    return success({ resellers: storeStats });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { storeId, action, userId, storeName, storeSlug, whatsappNumber } = await req.json();

    if (action === "approve") {
      // Approve reseller application - create store
      const [store] = await db
        .insert(resellerStores)
        .values({
          userId,
          storeName: storeName || "My Store",
          storeSlug: storeSlug || `store-${Date.now()}`,
          whatsappNumber,
        })
        .returning();

      await db
        .update(users)
        .set({ role: "reseller", updatedAt: new Date() })
        .where(eq(users.id, userId));

      return success({ store, message: "Reseller approved" });
    }

    if (action === "reject") {
      await db
        .update(users)
        .set({ role: "user", updatedAt: new Date() })
        .where(eq(users.id, userId));
      return success({ message: "Reseller application rejected" });
    }

    if (action === "toggle_active" && storeId) {
      const [store] = await db
        .select()
        .from(resellerStores)
        .where(eq(resellerStores.id, storeId))
        .limit(1);

      if (!store) return error("Store not found", 404);

      const [updated] = await db
        .update(resellerStores)
        .set({ isActive: !store.isActive })
        .where(eq(resellerStores.id, storeId))
        .returning();

      return success({ store: updated });
    }

    return error("Invalid action");
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Reseller action error:", err);
    return error("Internal server error", 500);
  }
}
