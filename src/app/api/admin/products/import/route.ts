import { NextRequest } from "next/server";
import { db } from "@/db";
import { products, providers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { providerId, packages } = await req.json();

    if (!providerId || !packages || !Array.isArray(packages)) {
      return error("Provider ID and packages array required");
    }

    const [provider] = await db
      .select()
      .from(providers)
      .where(eq(providers.id, providerId))
      .limit(1);

    if (!provider) return error("Provider not found", 404);

    const imported = [];
    for (const pkg of packages) {
      const [product] = await db
        .insert(products)
        .values({
          providerId,
          providerPackageId: pkg.id || pkg.providerPackageId,
          name: pkg.name,
          description: pkg.description || "",
          network: pkg.network || "",
          dataAmount: pkg.dataAmount || pkg.data_amount || "",
          validity: pkg.validity || "",
          price: String(pkg.price || pkg.user_price || 0),
          agentPrice: String(pkg.agentPrice || pkg.agent_price || pkg.price || 0),
          costPrice: String(pkg.costPrice || pkg.cost_price || 0),
          category: pkg.category || "data",
        })
        .returning();
      imported.push(product);
    }

    return success({ imported: imported.length, products: imported });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    console.error("Import error:", err);
    return error("Internal server error", 500);
  }
}
