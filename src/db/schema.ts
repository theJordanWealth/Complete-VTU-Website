import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "user",
  "reseller",
  "agent",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
]);
export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", [
  "pending",
  "processing",
  "completed",
  "rejected",
]);
export const notificationTargetEnum = pgEnum("notification_target", [
  "everyone",
  "resellers",
  "agents",
  "users",
]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  role: userRoleEnum("role").default("user").notNull(),
  isAgent: boolean("is_agent").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Site settings (singleton row)
export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteName: varchar("site_name", { length: 255 }).default("DataHub Ghana"),
  siteLogo: text("site_logo"),
  tagline: text("tagline").default("Fast & Reliable Data Bundles"),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  currency: varchar("currency", { length: 10 }).default("GHS"),
  minWithdrawal: decimal("min_withdrawal", { precision: 10, scale: 2 })
    .default("10")
    .notNull(),
  agentDiscount: integer("agent_discount").default(5),
  // Kora Pay settings
  koraPublicKey: text("kora_public_key"),
  koraSecretKey: text("kora_secret_key"),
  koraBaseUrl: text("kora_base_url").default("https://api.korapay.com"),
  // Paystack settings (optional)
  paystackPublicKey: text("paystack_public_key"),
  paystackSecretKey: text("paystack_secret_key"),
  paystackEnabled: boolean("paystack_enabled").default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Providers
export const providers = pgTable("providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  baseUrl: text("base_url").notNull(),
  apiKey: text("api_key").notNull(),
  apiEngine: varchar("api_engine", { length: 100 }),
  endpoints: jsonb("endpoints").default({}),
  isActive: boolean("is_active").default(true).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Products / Data packages
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  providerId: uuid("provider_id").references(() => providers.id),
  providerPackageId: varchar("provider_package_id", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).default("data"),
  network: varchar("network", { length: 50 }),
  dataAmount: varchar("data_amount", { length: 50 }),
  validity: varchar("validity", { length: 50 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  agentPrice: decimal("agent_price", { precision: 10, scale: 2 }),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  resellerStoreId: uuid("reseller_store_id").references(
    () => resellerStores.id
  ),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  network: varchar("network", { length: 50 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  costAmount: decimal("cost_amount", { precision: 10, scale: 2 }),
  profit: decimal("profit", { precision: 10, scale: 2 }).default("0"),
  status: orderStatusEnum("status").default("pending").notNull(),
  providerOrderId: varchar("provider_order_id", { length: 255 }),
  providerResponse: jsonb("provider_response"),
  isGuest: boolean("is_guest").default(false),
  guestEmail: varchar("guest_email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  type: varchar("type", { length: 50 }).notNull(), // wallet_topup, order_payment, withdrawal, refund
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  reference: varchar("reference", { length: 255 }).unique(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reseller stores
export const resellerStores = pgTable("reseller_stores", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),
  storeName: varchar("store_name", { length: 255 }).notNull(),
  storeSlug: varchar("store_slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  logoUrl: text("logo_url"),
  customTheme: varchar("custom_theme", { length: 50 }).default("default"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reseller custom prices
export const resellerPrices = pgTable("reseller_prices", {
  id: uuid("id").defaultRandom().primaryKey(),
  resellerStoreId: uuid("reseller_store_id")
    .references(() => resellerStores.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  customPrice: decimal("custom_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reseller customers
export const resellerCustomers = pgTable("reseller_customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  resellerStoreId: uuid("reseller_store_id")
    .references(() => resellerStores.id)
    .notNull(),
  userId: uuid("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }),
  totalOrders: integer("total_orders").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reseller withdrawal requests
export const resellerWithdrawals = pgTable("reseller_withdrawals", {
  id: uuid("id").defaultRandom().primaryKey(),
  resellerStoreId: uuid("reseller_store_id")
    .references(() => resellerStores.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: withdrawalStatusEnum("status").default("pending").notNull(),
  accountName: varchar("account_name", { length: 255 }),
  accountNumber: varchar("account_number", { length: 50 }),
  bankName: varchar("bank_name", { length: 100 }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  target: notificationTargetEnum("target").default("everyone").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User notifications (read tracking)
export const userNotifications = pgTable("user_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  notificationId: uuid("notification_id")
    .references(() => notifications.id)
    .notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
  transactions: many(transactions),
  resellerStore: many(resellerStores),
  userNotifications: many(userNotifications),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  provider: one(providers, {
    fields: [products.providerId],
    references: [providers.id],
  }),
  orders: many(orders),
  resellerPrices: many(resellerPrices),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  resellerStore: one(resellerStores, {
    fields: [orders.resellerStoreId],
    references: [resellerStores.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const resellerStoresRelations = relations(
  resellerStores,
  ({ one, many }) => ({
    user: one(users, {
      fields: [resellerStores.userId],
      references: [users.id],
    }),
    prices: many(resellerPrices),
    customers: many(resellerCustomers),
    withdrawals: many(resellerWithdrawals),
    orders: many(orders),
  })
);

export const resellerPricesRelations = relations(resellerPrices, ({ one }) => ({
  store: one(resellerStores, {
    fields: [resellerPrices.resellerStoreId],
    references: [resellerStores.id],
  }),
  product: one(products, {
    fields: [resellerPrices.productId],
    references: [products.id],
  }),
}));

export const resellerCustomersRelations = relations(
  resellerCustomers,
  ({ one }) => ({
    store: one(resellerStores, {
      fields: [resellerCustomers.resellerStoreId],
      references: [resellerStores.id],
    }),
    user: one(users, {
      fields: [resellerCustomers.userId],
      references: [users.id],
    }),
  })
);

export const resellerWithdrawalsRelations = relations(
  resellerWithdrawals,
  ({ one }) => ({
    store: one(resellerStores, {
      fields: [resellerWithdrawals.resellerStoreId],
      references: [resellerStores.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ many }) => ({
  userNotifications: many(userNotifications),
}));

export const userNotificationsRelations = relations(
  userNotifications,
  ({ one }) => ({
    user: one(users, {
      fields: [userNotifications.userId],
      references: [users.id],
    }),
    notification: one(notifications, {
      fields: [userNotifications.notificationId],
      references: [notifications.id],
    }),
  })
);
