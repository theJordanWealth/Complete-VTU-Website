import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const activeProducts = await db
      .select()
      .from(products)
      .where(and(eq(products.isActive, true)));

    return success({ products: activeProducts });
  } catch (err) {
    console.error("Products error:", err);
    return error("Internal server error", 500);
  }
}
