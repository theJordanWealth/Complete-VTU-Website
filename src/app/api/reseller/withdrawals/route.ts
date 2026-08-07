import { NextRequest } from "next/server";
import { db } from "@/db";
import { resellerStores, resellerWithdrawals, orders, siteSettings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
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

    const withdrawals = await db
      .select()
      .from(resellerWithdrawals)
      .where(eq(resellerWithdrawals.resellerStoreId, store.id));

    return success({ withdrawals });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { amount, accountName, accountNumber, bankName } = await req.json();

    if (!amount || !accountName || !accountNumber || !bankName) {
      return error("All fields are required");
    }

    const [store] = await db
      .select()
      .from(resellerStores)
      .where(eq(resellerStores.userId, session.userId))
      .limit(1);

    if (!store) return error("No reseller store found", 404);

    // Check minimum withdrawal
    const [settings] = await db.select().from(siteSettings).limit(1);
    const minWithdrawal = parseFloat(settings?.minWithdrawal || "10");

    if (parseFloat(amount) < minWithdrawal) {
      return error(`Minimum withdrawal is GHS ${minWithdrawal.toFixed(2)}`);
    }

    // Check available balance
    const [profitStats] = await db
      .select({
        totalProfit: sql<string>`coalesce(sum(${orders.profit}), 0)`,
      })
      .from(orders)
      .where(eq(orders.resellerStoreId, store.id));

    const [withdrawalStats] = await db
      .select({
        totalWithdrawn: sql<string>`coalesce(sum(${resellerWithdrawals.amount}) filter (where ${resellerWithdrawals.status} in ('completed', 'pending')), 0)`,
      })
      .from(resellerWithdrawals)
      .where(eq(resellerWithdrawals.resellerStoreId, store.id));

    const available =
      parseFloat(profitStats?.totalProfit || "0") -
      parseFloat(withdrawalStats?.totalWithdrawn || "0");

    if (parseFloat(amount) > available) {
      return error("Insufficient earnings balance");
    }

    const [withdrawal] = await db
      .insert(resellerWithdrawals)
      .values({
        resellerStoreId: store.id,
        amount: String(amount),
        accountName,
        accountNumber,
        bankName,
      })
      .returning();

    return success({
      withdrawal,
      message:
        "Withdrawal request submitted. Earnings will be sent in the next business day.",
    });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
