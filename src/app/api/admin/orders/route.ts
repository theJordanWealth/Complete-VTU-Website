import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, users, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const allOrders = await db
      .select({
        id: orders.id,
        userId: orders.userId,
        userName: users.name,
        userEmail: users.email,
        productId: orders.productId,
        productName: products.name,
        phoneNumber: orders.phoneNumber,
        network: orders.network,
        amount: orders.amount,
        costAmount: orders.costAmount,
        profit: orders.profit,
        status: orders.status,
        providerOrderId: orders.providerOrderId,
        providerResponse: orders.providerResponse,
        isGuest: orders.isGuest,
        resellerStoreId: orders.resellerStoreId,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(products, eq(orders.productId, products.id));

    return success({ orders: allOrders });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { orderId, status, providerOrderId, providerResponse } = await req.json();

    if (!orderId) return error("Order ID required");

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (providerOrderId) updates.providerOrderId = providerOrderId;
    if (providerResponse) updates.providerResponse = providerResponse;

    const [updated] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, orderId))
      .returning();

    return success({ order: updated });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
