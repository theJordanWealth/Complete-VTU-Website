import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin, hashPassword, createToken } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    await requireAdmin();
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        whatsappNumber: users.whatsappNumber,
        role: users.role,
        isAgent: users.isAgent,
        isActive: users.isActive,
        balance: users.balance,
        createdAt: users.createdAt,
      })
      .from(users);
    return success({ users: allUsers });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
    const { userId, ...updates } = await req.json();

    if (!userId) return error("User ID required");

    // If password is being reset
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    return success({ user: { id: updated.id, email: updated.email, name: updated.name, role: updated.role } });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { action, userId } = await req.json();

    if (action === "login_as") {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user) return error("User not found", 404);

      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const response = success({
        message: `Logged in as ${user.name}`,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    return error("Invalid action");
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
