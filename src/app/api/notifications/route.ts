import { db } from "@/db";
import { notifications, userNotifications } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();

    let activeNotifications;

    if (session) {
      activeNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.isActive, true));
    } else {
      activeNotifications = await db
        .select()
        .from(notifications)
        .where(and(eq(notifications.isActive, true), eq(notifications.target, "everyone")));
    }

    return success({ notifications: activeNotifications });
  } catch (err) {
    return error("Internal server error", 500);
  }
}
