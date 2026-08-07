import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return error("Not authenticated", 401);
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        whatsappNumber: users.whatsappNumber,
        role: users.role,
        isAgent: users.isAgent,
        balance: users.balance,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      return error("User not found", 404);
    }

    return success({ user });
  } catch (err) {
    console.error("Me error:", err);
    return error("Internal server error", 500);
  }
}
