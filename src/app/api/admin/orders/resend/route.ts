import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, providers, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { orderId } = await req.json();

    if (!orderId) return error("Order ID required");

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) return error("Order not found", 404);

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, order.productId))
      .limit(1);

    if (!product?.providerId) return error("Product has no provider", 400);

    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, product.providerId))
      .limit(1);

    if (!provider) return error("Provider not found", 404);

    // Attempt to send order to provider
    const endpoints = provider.endpoints as Record<string, string>;
    const orderEndpoint = endpoints?.order || "/api/order";

    try {
      const providerResponse = await fetch(`${provider.baseUrl}${orderEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          phone: order.phoneNumber,
          package_id: product.providerPackageId || product.id,
          network: order.network || product.network,
        }),
      });

      const result = await providerResponse.json();

      await db
        .update(orders)
        .set({
          status: providerResponse.ok ? "processing" : "failed",
          providerResponse: result,
          providerOrderId: result.order_id || result.id || null,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      return success({
        message: providerResponse.ok
          ? "Order resent successfully"
          : "Provider returned an error",
        providerResponse: result,
      });
    } catch (fetchErr) {
      await db
        .update(orders)
        .set({
          status: "failed",
          providerResponse: { error: "Connection failed" },
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      return error("Failed to connect to provider");
    }
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
