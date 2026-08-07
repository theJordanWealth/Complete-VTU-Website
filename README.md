# DataHub Ghana - Data Selling Platform

A full-featured data bundle selling platform built with Next.js, PostgreSQL, and Drizzle ORM. Designed for the Ghanaian market with GHS currency support.

## 🚀 Features

### Core Features
- **Data Bundle Sales** — Sell MTN, Vodafone, and AirtelTigo data bundles
- **Wallet System** — Users can fund their wallet and pay from balance
- **Guest Checkout** — Non-registered users can buy data
- **Multi-Provider Support** — Connect multiple API providers for data delivery
- **Auto-Order Processing** — Orders are sent to providers automatically
- **Agent Pricing** — Special discounted prices for assigned agents

### Admin Panel
- **Dashboard** — Full analytics with revenue, orders, users, and reseller stats
- **Site Settings** — Configure site name, logo, tagline, and WhatsApp number
- **User Management** — View all users, assign roles (agent), login as any user
- **Provider Management** — Add/edit multiple API providers (base URL, endpoints, API keys)
- **Product Management** — Add products manually or import from providers
- **Order Management** — View all orders, resend failed orders to providers
- **Reseller Hub** — Monitor all reseller storefronts, performance, and statistics
- **Withdrawal Management** — Approve or reject reseller withdrawal requests
- **Notifications** — Send targeted notifications (everyone, resellers, agents, users)
- **Payment Settings** — Configure Kora Pay (primary) and Paystack (optional)

### Reseller System
- **Storefront** — Each reseller gets a beautiful, branded storefront
- **Custom Pricing** — Set custom prices per product (add profit margins)
- **Customer Tracking** — See all customers, orders, contact numbers
- **Withdrawals** — Request withdrawals (minimum threshold set by admin)
- **Analytics** — Revenue, profit, orders, and customer statistics
- **WhatsApp Button** — Configurable WhatsApp contact button on storefront

### User Dashboard
- **Wallet** — View balance, top up, and transaction history
- **Orders** — View all orders with status tracking
- **Become a Reseller** — Apply to become a reseller
- **Notifications** — Bell icon with notification count

### Theme & UX
- **Dark/Light Mode** — Toggle with persistent preference
- **3D Professional UI** — Glass effects, gradients, smooth animations
- **WhatsApp Button** — Floating WhatsApp contact button
- **Responsive Design** — Works on all devices
- **GHS Currency** — Ghana Cedis throughout the platform

## 📋 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=your-super-secret-jwt-key-change-me
KORA_PUBLIC_KEY=your_kora_public_key
KORA_SECRET_KEY=your_kora_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
```

## 🔑 Seeded Credentials

| Role      | Email                | Password       |
|-----------|----------------------|----------------|
| Admin     | admin@datahub.gh     | Admin@12345    |
| User      | user@datahub.gh      | User@12345     |
| Reseller  | reseller@datahub.gh  | Reseller@12345 |

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: JWT with HTTP-only cookies (jose + bcryptjs)
- **Payments**: Kora Pay (primary), Paystack (optional)
- **Icons**: Lucide React

## 📦 Installation

### Local Development

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd datahub-ghana

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your database and API credentials

# 4. Set up database
npx drizzle-kit push

# 5. Seed the database
npx tsx src/db/seed.ts

# 6. Start development server
npm run dev
```

### Production Deployment

```bash
# 1. Build the application
npm run build

# 2. Start production server
npm start
```

## 🗄️ Database Schema

The platform uses the following tables:

- **users** — User accounts with roles (admin, user, reseller, agent)
- **site_settings** — Singleton table for site configuration
- **providers** — API provider configurations
- **products** — Data packages with pricing tiers
- **orders** — Purchase records with provider status
- **transactions** — Wallet transactions (top-up, payments)
- **reseller_stores** — Reseller storefront configurations
- **reseller_prices** — Custom pricing per reseller
- **reseller_customers** — Customer tracking per store
- **reseller_withdrawals** — Withdrawal requests
- **notifications** — Site-wide notifications
- **user_notifications** — Read tracking for notifications

## 🔌 Provider API Integration

The platform connects to data providers via REST APIs. Configure in admin panel:

1. Go to **Admin → Providers**
2. Add provider with:
   - Base URL (e.g., `https://api.provider.com`)
   - API Key
   - API Engine version
   - Endpoints JSON: `{"order": "/api/v1/order", "balance": "/api/v1/balance", "packages": "/api/v1/packages"}`

### Importing Packages

1. Go to **Admin → Products → Import**
2. Select the provider
3. Paste JSON array of packages:
```json
[
  {
    "name": "MTN 1GB Daily",
    "price": 3.00,
    "agentPrice": 2.50,
    "costPrice": 2.00,
    "network": "MTN",
    "dataAmount": "1GB",
    "validity": "1 Day"
  }
]
```

## 💳 Payment Integration

### Kora Pay (Primary)
1. Get your API keys from [Kora Pay](https://korapay.com)
2. Add keys in **Admin → Settings → Kora Pay**

### Paystack (Optional)
1. Get your API keys from [Paystack](https://paystack.com)
2. Enable Paystack in **Admin → Settings → Paystack**

## 🏪 Reseller Flow

1. User registers and logs in
2. Goes to **Dashboard → Become a Reseller**
3. Sets up store name, description, and WhatsApp number
4. Gets a unique store URL (e.g., `/store/quick-data-store`)
5. Shares the link with customers
6. Customers buy data through the storefront
7. Reseller earns profit from price difference
8. Reseller requests withdrawal when balance meets minimum threshold
9. Admin approves withdrawal

## 📱 WhatsApp Integration

- **Site-wide**: Admin sets WhatsApp number in Settings
- **Reseller Store**: Each reseller configures their own WhatsApp number
- Both show as floating green WhatsApp buttons

## 🔐 Admin Login-as-User

Admins can log in as any user from **Admin → Users** by clicking the login icon. This helps troubleshoot user account issues.

## 📖 API Endpoints

### Public
- `GET /api/settings` — Public site settings
- `GET /api/products` — Active products
- `GET /api/store/[slug]` — Reseller storefront
- `POST /api/orders` — Place an order (auth optional)

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### User (authenticated)
- `GET /api/wallet` — Wallet balance + transactions
- `POST /api/wallet` — Initiate top-up
- `PUT /api/wallet` — Confirm payment
- `GET /api/orders` — User's orders
- `GET /api/notifications` — Active notifications

### Reseller
- `POST /api/reseller/apply` — Apply to become reseller
- `GET /api/reseller/dashboard` — Dashboard stats
- `GET /api/reseller/store` — Store settings
- `PUT /api/reseller/store` — Update store
- `POST /api/reseller/store` — Set custom price
- `GET /api/reseller/orders` — Store orders
- `GET /api/reseller/customers` — Store customers
- `GET /api/reseller/withdrawals` — Withdrawal history
- `POST /api/reseller/withdrawals` — Request withdrawal

### Admin
- `GET /api/admin/stats` — Platform statistics
- `GET/PUT /api/admin/settings` — Site settings
- `GET/POST/PUT /api/admin/users` — User management
- `GET/POST/PUT/DELETE /api/admin/providers` — Provider management
- `GET/POST/PUT/DELETE /api/admin/products` — Product management
- `POST /api/admin/products/import` — Import packages
- `GET/PUT /api/admin/orders` — Order management
- `POST /api/admin/orders/resend` — Resend failed order
- `GET/PUT /api/admin/resellers` — Reseller management
- `GET/PUT /api/admin/withdrawals` — Withdrawal management
- `GET/POST/PUT/DELETE /api/admin/notifications` — Notifications

## 📄 License

This project is proprietary software for DataHub Ghana.

---

Built with ❤️ for Ghana's data market 🇬🇭
