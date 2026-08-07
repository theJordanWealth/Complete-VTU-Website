import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { success, error } from "@/lib/api-response";

export async function GET() {
  try {
    const [settings] = await db.select().from(siteSettings).limit(1);
    // Return only public-facing settings
    return success({
      settings: {
        siteName: settings?.siteName || "DataHub Ghana",
        siteLogo: settings?.siteLogo,
        tagline: settings?.tagline || "Fast & Reliable Data Bundles",
        whatsappNumber: settings?.whatsappNumber,
        currency: settings?.currency || "GHS",
      },
    });
  } catch (err) {
    console.error("Settings error:", err);
    return error("Internal server error", 500);
  }
}
