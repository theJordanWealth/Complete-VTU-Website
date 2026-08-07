import { NextRequest } from "next/server";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";
import { success, error } from "@/lib/api-response";
import { generateReference } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAuth();

    const [user] = await db
      .select({ balance: users.balance })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const txns = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, session.userId))
      .orderBy(transactions.createdAt);

    return success({ balance: user?.balance || "0", transactions: txns });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { amount, paymentMethod } = await req.json();

    if (!amount || amount <= 0) return error("Invalid amount");

    const reference = generateReference();

    // Create pending transaction
    const [txn] = await db
      .insert(transactions)
      .values({
        userId: session.userId,
        type: "wallet_topup",
        amount: String(amount),
        status: "pending",
        reference,
        paymentMethod: paymentMethod || "kora",
      })
      .returning();

    return success({ transaction: txn, reference });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { reference, status } = await req.json();

    if (!reference) return error("Reference required");

    const [txn] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.reference, reference))
      .limit(1);

    if (!txn) return error("Transaction not found", 404);
    if (txn.userId !== session.userId) return error("Forbidden", 403);
    if (txn.status !== "pending") return error("Transaction already processed");

    if (status === "completed") {
      // Credit wallet
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} + ${txn.amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.userId));

      await db
        .update(transactions)
        .set({ status: "completed" })
        .where(eq(transactions.reference, reference));

      return success({ message: "Wallet funded successfully" });
    }

    if (status === "failed") {
      await db
        .update(transactions)
        .set({ status: "failed" })
        .where(eq(transactions.reference, reference));
      return success({ message: "Transaction marked as failed" });
    }

    return error("Invalid status");
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
