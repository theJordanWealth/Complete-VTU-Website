import { NextRequest } from "next/server";
import { db } from "@/db";
import { userNotifications } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { notificationId } = await req.json();

    await db
      .insert(userNotifications)
      .values({
        userId: session.userId,
        notificationId,
        isRead: true,
      })
      .onConflictDoNothing();

    return success({ message: "Marked as read" });
  } catch (err) {
    if ((err as Error).message === "Unauthorized") return error("Unauthorized", 401);
    return error("Internal server error", 500);
  }
}
