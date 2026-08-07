import { NextRequest } from "next/server";
import { db } from "@/db";
import { orders, users, products, providers, resellerStores, resellerPrices, resellerCustomers } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { productId, phoneNumber, isGuest, guestEmail, resellerSlug } = body;

    if (!productId || !phoneNumber) {
      return error("Product ID and phone number are required");
    }

    // Get product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product || !product.isActive) {
      return error("Product not found or unavailable", 404);
    }

    let finalPrice = parseFloat(product.price);
    let userId = session?.userId || null;
    let resellerStoreId: string | null = null;

    // Check if ordered through a reseller storefront
    if (resellerSlug) {
      const [store] = await db
        .select()
        .from(resellerStores)
        .where(and(eq(resellerStores.storeSlug, resellerSlug), eq(resellerStores.isActive, true)))
        .limit(1);

      if (store) {
        resellerStoreId = store.id;

        // Check custom price
        const [customPrice] = await db
          .select()
          .from(resellerPrices)
          .where(
            and(
              eq(resellerPrices.resellerStoreId, store.id),
              eq(resellerPrices.productId, productId)
            )
          )
          .limit(1);

        if (customPrice) {
          finalPrice = parseFloat(customPrice.customPrice);
        }
      }
    }

    // Check agent pricing
    if (session?.userId) {
      const [user] = await db
        .select({ isAgent: users.isAgent })
        .from(users)
        .where(eq(users.id, session.userId))
        .limit(1);

      if (user?.isAgent && product.agentPrice) {
        finalPrice = parseFloat(product.agentPrice);
      }
    }

    // If not guest, check wallet balance
    if (!isGuest && userId) {
      const [user] = await db
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || parseFloat(user.balance) < finalPrice) {
        return error("Insufficient wallet balance. Please top up your wallet.");
      }

      // Deduct from wallet
      await db
        .update(users)
        .set({
          balance: sql`${users.balance} - ${String(finalPrice)}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } else if (isGuest) {
      // For guest checkout, they must have paid already (handled externally)
      // Create a temporary user or mark as guest
      userId = null;
    }

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: userId!,
        productId,
        phoneNumber,
        network: product.network || "",
        amount: String(finalPrice),
        costAmount: product.costPrice || "0",
        profit: String(finalPrice - parseFloat(product.costPrice || "0")),
        status: "pending",
        isGuest: isGuest || false,
        guestEmail: guestEmail || null,
        resellerStoreId: resellerStoreId || undefined,
      })
      .returning();

    // Track reseller customer
    if (resellerStoreId && userId) {
      const [existingCustomer] = await db
        .select()
        .from(resellerCustomers)
        .where(
          and(
            eq(resellerCustomers.resellerStoreId, resellerStoreId),
            eq(resellerCustomers.userId, userId)
          )
        )
        .limit(1);

      if (existingCustomer) {
        await db
          .update(resellerCustomers)
          .set({
            totalOrders: sql`${resellerCustomers.totalOrders} + 1`,
            totalSpent: sql`${resellerCustomers.totalSpent} + ${String(finalPrice)}`,
          })
          .where(eq(resellerCustomers.id, existingCustomer.id));
      } else {
        await db.insert(resellerCustomers).values({
          resellerStoreId,
          userId,
          phone: phoneNumber,
          totalOrders: 1,
          totalSpent: String(finalPrice),
        });
      }
    }

    // Attempt to send to provider automatically
    if (product.providerId) {
      try {
        const [provider] = await db
          .select()
          .from(providers)
          .where(and(eq(providers.id, product.providerId), eq(providers.isActive, true)))
          .limit(1);

        if (provider) {
          const endpoints = provider.endpoints as Record<string, string>;
          const orderEndpoint = endpoints?.order || "/api/order";

          const providerRes = await fetch(`${provider.baseUrl}${orderEndpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${provider.apiKey}`,
            },
            body: JSON.stringify({
              phone: phoneNumber,
              package_id: product.providerPackageId || product.id,
              network: product.network,
            }),
          });

          const result = await providerRes.json();

          await db
            .update(orders)
            .set({
              status: providerRes.ok ? "processing" : "failed",
              providerResponse: result,
              providerOrderId: result?.order_id || result?.id || null,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id));

          if (!providerRes.ok) {
            return success({
              order: { ...order, status: "failed" },
              message: "Order placed but provider processing failed. Please retry.",
              providerError: result,
            });
          }
        }
      } catch (providerErr) {
        console.error("Provider error:", providerErr);
        // Order still created, admin can retry
      }
    }

    // Fetch updated order
    const [updatedOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id))
      .limit(1);

    return success({ order: updatedOrder, message: "Order placed successfully!" });
  } catch (err) {
    console.error("Order error:", err);
    return error("Internal server error", 500);
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return error("Not authenticated", 401);
    }

    const userOrders = await db
      .select({
        id: orders.id,
        phoneNumber: orders.phoneNumber,
        network: orders.network,
        amount: orders.amount,
        status: orders.status,
        createdAt: orders.createdAt,
        productName: products.name,
        dataAmount: products.dataAmount,
        validity: products.validity,
      })
      .from(orders)
      .leftJoin(products, eq(orders.productId, products.id))
      .where(eq(orders.userId, session.userId));

    return success({ orders: userOrders });
  } catch (err) {
    return error("Internal server error", 500);
  }
}
