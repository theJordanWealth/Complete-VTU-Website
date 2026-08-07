import { db } from "@/db";
import { resellerStores, orders, resellerCustomers, resellerWithdrawals, resellerPrices, products, users } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
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

    // Get order stats
    const [orderStats] = await db
      .select({
        totalOrders: sql<number>`count(*)::int`,
        totalRevenue: sql<string>`coalesce(sum(${orders.amount}), 0)`,
        totalProfit: sql<string>`coalesce(sum(${orders.profit}), 0)`,
        todayOrders: sql<number>`count(*) filter (where ${orders.createdAt} >= current_date)::int`,
        todayRevenue: sql<string>`coalesce(sum(${orders.amount}) filter (where ${orders.createdAt} >= current_date), 0)`,
      })
      .from(orders)
      .where(eq(orders.resellerStoreId, store.id));

    // Get customer count
    const [customerStats] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(resellerCustomers)
      .where(eq(resellerCustomers.resellerStoreId, store.id));

    // Get withdrawals
    const [withdrawalStats] = await db
      .select({
        totalWithdrawn: sql<string>`coalesce(sum(${resellerWithdrawals.amount}) filter (where ${resellerWithdrawals.status} = 'completed'), 0)`,
        pendingWithdrawal: sql<string>`coalesce(sum(${resellerWithdrawals.amount}) filter (where ${resellerWithdrawals.status} = 'pending'), 0)`,
      })
      .from(resellerWithdrawals)
      .where(eq(resellerWithdrawals.resellerStoreId, store.id));

    // Calculate available balance (profit - withdrawn - pending)
    const totalProfit = parseFloat(orderStats?.totalProfit || "0");
    const totalWithdrawn = parseFloat(withdrawalStats?.totalWithdrawn || "0");
    const pendingWithdrawal = parseFloat(withdrawalStats?.pendingWithdrawal || "0");
    const availableBalance = totalProfit - totalWithdrawn - pendingWithdrawal;

    // Get user's wallet balance
    const [user] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    // Recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        phoneNumber: orders.phoneNumber,
        amount: orders.amount,
        profit: orders.profit,
        status: orders.status,
        createdAt: orders.createdAt,
        productName: products.name,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.resellerStoreId, store.id))
      .orderBy(orders.createdAt)
      .limit(10);

    // Get settings for min withdrawal
    const { siteSettings: ss } = await import("@/db/schema");
    const [settings] = await db.select().from(ss).limit(1);

    return success({
      store,
      walletBalance: user?.balance || "0",
      stats: {
        totalOrders: orderStats?.totalOrders || 0,
        totalRevenue: orderStats?.totalRevenue || "0",
        totalProfit: orderStats?.totalProfit || "0",
        todayOrders: orderStats?.todayOrders || 0,
        todayRevenue: orderStats?.todayRevenue || "0",
        customerCount: customerStats?.count || 0,
        totalWithdrawn: withdrawalStats?.totalWithdrawn || "0",
        pendingWithdrawal: withdrawalStats?.pendingWithdrawal || "0",
        availableBalance: String(Math.max(0, availableBalance)),
      },
      minWithdrawal: settings?.minWithdrawal || "10",
      recentOrders,
    });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Reseller dashboard error:", err);
    return error("Internal server error", 500);
  }
}
