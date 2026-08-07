import { NextRequest } from "next/server";
import { db } from "@/db";
import { resellerWithdrawals, resellerStores, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();

    const withdrawals = await db
      .select({
        id: resellerWithdrawals.id,
        amount: resellerWithdrawals.amount,
        status: resellerWithdrawals.status,
        accountName: resellerWithdrawals.accountName,
        accountNumber: resellerWithdrawals.accountNumber,
        bankName: resellerWithdrawals.bankName,
        createdAt: resellerWithdrawals.createdAt,
        processedAt: resellerWithdrawals.processedAt,
        storeName: resellerStores.storeName,
        storeId: resellerStores.id,
        userName: users.name,
        userEmail: users.email,
      })
      .from(resellerWithdrawals)
      .leftJoin(resellerStores, eq(resellerWithdrawals.resellerStoreId, resellerStores.id))
      .leftJoin(users, eq(resellerStores.userId, users.id));

    return success({ withdrawals });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { withdrawalId, status } = await req.json();

    if (!withdrawalId || !status) return error("Withdrawal ID and status required");

    const [updated] = await db
      .update(resellerWithdrawals)
      .set({
        status,
        processedAt: status === "completed" ? new Date() : undefined,
      })
      .where(eq(resellerWithdrawals.id, withdrawalId))
      .returning();

    return success({ withdrawal: updated });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
