import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return error("Email and password are required");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return error("Invalid credentials", 401);
    }

    if (!user.isActive) {
      return error("Account is disabled. Contact support.", 403);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return error("Invalid credentials", 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAgent: user.isAgent,
        balance: user.balance,
      },
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return error("Internal server error", 500);
  }
}
