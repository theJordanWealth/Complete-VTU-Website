import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { hashPassword } from "../lib/auth";
import { eq } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await hashPassword("Admin@12345");
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@datahub.gh",
      password: adminPassword,
      name: "Admin User",
      phone: "+233000000000",
      whatsappNumber: "+233000000000",
      role: "admin",
      balance: "0",
    })
    .onConflictDoNothing()
    .returning();

  // Create regular user
  const userPassword = await hashPassword("User@12345");
  const [user] = await db
    .insert(schema.users)
    .values({
      email: "user@datahub.gh",
      password: userPassword,
      name: "Regular User",
      phone: "+233111111111",
      whatsappNumber: "+233111111111",
      role: "user",
      balance: "50.00",
    })
    .onConflictDoNothing()
    .returning();

  // Create reseller user
  const resellerPassword = await hashPassword("Reseller@12345");
  const [reseller] = await db
    .insert(schema.users)
    .values({
      email: "reseller@datahub.gh",
      password: resellerPassword,
      name: "Reseller User",
      phone: "+233222222222",
      whatsappNumber: "+233222222222",
      role: "reseller",
      balance: "100.00",
    })
    .onConflictDoNothing()
    .returning();

  // Create site settings
  await db
    .insert(schema.siteSettings)
    .values({
      siteName: "DataHub Ghana",
      tagline: "Fast & Reliable Data Bundles in Ghana",
      currency: "GHS",
      minWithdrawal: "10.00",
      whatsappNumber: "+233000000000",
      paystackEnabled: false,
    })
    .onConflictDoNothing();

  // Create a sample provider
  const [provider] = await db
    .insert(schema.providers)
    .values({
      name: "Sample Provider",
      baseUrl: "https://api.example-provider.com",
      apiKey: "sample-api-key",
      apiEngine: "v1",
      endpoints: {
        order: "/api/v1/order",
        balance: "/api/v1/balance",
        packages: "/api/v1/packages",
      },
    })
    .onConflictDoNothing()
    .returning();

  // Create sample products
  if (provider) {
    const products = [
      {
        providerId: provider.id,
        name: "MTN 1GB Daily",
        description: "1GB data bundle valid for 1 day on MTN network",
        network: "MTN",
        dataAmount: "1GB",
        validity: "1 Day",
        price: "3.00",
        agentPrice: "2.50",
        costPrice: "2.00",
        category: "data",
      },
      {
        providerId: provider.id,
        name: "MTN 2GB Weekly",
        description: "2GB data bundle valid for 7 days on MTN network",
        network: "MTN",
        dataAmount: "2GB",
        validity: "7 Days",
        price: "8.00",
        agentPrice: "7.00",
        costPrice: "6.00",
        category: "data",
      },
      {
        providerId: provider.id,
        name: "MTN 5GB Monthly",
        description: "5GB data bundle valid for 30 days on MTN network",
        network: "MTN",
        dataAmount: "5GB",
        validity: "30 Days",
        price: "20.00",
        agentPrice: "17.00",
        costPrice: "15.00",
        category: "data",
      },
      {
        providerId: provider.id,
        name: "Vodafone 1.5GB Daily",
        description: "1.5GB data bundle valid for 1 day on Vodafone",
        network: "Vodafone",
        dataAmount: "1.5GB",
        validity: "1 Day",
        price: "3.50",
        agentPrice: "3.00",
        costPrice: "2.50",
        category: "data",
      },
      {
        providerId: provider.id,
        name: "AirtelTigo 3GB Weekly",
        description: "3GB data bundle valid for 7 days on AirtelTigo",
        network: "AirtelTigo",
        dataAmount: "3GB",
        validity: "7 Days",
        price: "10.00",
        agentPrice: "8.50",
        costPrice: "7.50",
        category: "data",
      },
    ];

    for (const p of products) {
      await db
        .insert(schema.products)
        .values(p)
        .onConflictDoNothing();
    }
  }

  // Create reseller store for the reseller user
  if (reseller) {
    const [store] = await db
      .insert(schema.resellerStores)
      .values({
        userId: reseller.id,
        storeName: "Quick Data Store",
        storeSlug: "quick-data-store",
        description: "Your one-stop shop for affordable data bundles!",
        whatsappNumber: "+233222222222",
      })
      .onConflictDoNothing()
      .returning();

    if (store) {
      // Update reseller role
      await db
        .update(schema.users)
        .set({ role: "reseller" })
        .where(eq(schema.users.id, reseller.id));
    }
  }

  // Create sample notification
  await db
    .insert(schema.notifications)
    .values({
      title: "Welcome to DataHub Ghana! 🎉",
      message:
        "Get the best data bundle deals in Ghana. Top up your wallet and start buying data at the cheapest prices!",
      target: "everyone",
      isActive: true,
    })
    .onConflictDoNothing();

  console.log("✅ Seed completed!");
  console.log("Admin: admin@datahub.gh / Admin@12345");
  console.log("User: user@datahub.gh / User@12345");
  console.log("Reseller: reseller@datahub.gh / Reseller@12345");

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
