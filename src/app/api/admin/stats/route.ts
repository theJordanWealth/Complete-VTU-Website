import { db } from "@/db";
import { users, orders, products, resellerStores, transactions } from "@/db/schema";
import { sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();

    const [userStats] = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const [orderStats] = await db.select({
      count: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.amount}), 0)`,
      profit: sql<string>`coalesce(sum(${orders.profit}), 0)`,
    }).from(orders);
    const [productStats] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
    const [resellerStats] = await db.select({ count: sql<number>`count(*)::int` }).from(resellerStores);
    const [txnStats] = await db.select({
      totalDeposits: sql<string>`coalesce(sum(${transactions.amount}) filter (where ${transactions.type} = 'wallet_topup' and ${transactions.status} = 'completed'), 0)`,
    }).from(transactions);

    const [todayOrders] = await db.select({
      count: sql<number>`count(*)::int`,
      revenue: sql<string>`coalesce(sum(${orders.amount}), 0)`,
    }).from(orders).where(sql`${orders.createdAt} >= current_date`);

    return success({
      stats: {
        totalUsers: userStats?.count || 0,
        totalOrders: orderStats?.count || 0,
        totalRevenue: orderStats?.revenue || "0",
        totalProfit: orderStats?.profit || "0",
        totalProducts: productStats?.count || 0,
        totalResellers: resellerStats?.count || 0,
        totalDeposits: txnStats?.totalDeposits || "0",
        todayOrders: todayOrders?.count || 0,
        todayRevenue: todayOrders?.revenue || "0",
      },
    });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
