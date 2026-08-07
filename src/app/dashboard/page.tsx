"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  Wallet,
  ShoppingBag,
  Clock,
  TrendingUp,
  ArrowRight,
  Store,
  UserPlus,
} from "lucide-react";

interface DashboardData {
  orders: Array<{
    id: string;
    productName: string;
    amount: string;
    status: string;
    createdAt: string;
    phoneNumber: string;
  }>;
}

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  const recentOrders = data?.orders?.slice(0, 5) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome back, {user.name}! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s an overview of your account
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/wallet" className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Wallet Balance
              </p>
              <p className="text-2xl font-black mt-1" style={{ color: "var(--accent)" }}>
                GHS {parseFloat(user.balance).toFixed(2)}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(124, 58, 237, 0.1)", color: "var(--accent)" }}
            >
              <Wallet size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: "var(--accent)" }}>
            <span>Top up wallet</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        <Link href="/dashboard/orders" className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Total Orders
              </p>
              <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                {data?.orders?.length || 0}
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--info)" }}
            >
              <ShoppingBag size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: "var(--info)" }}>
            <span>View orders</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        <Link href="/products" className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Buy Data
              </p>
              <p className="text-lg font-bold mt-1" style={{ color: "var(--success)" }}>
                Browse Bundles
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}
            >
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: "var(--success)" }}>
            <span>Shop now</span>
            <ArrowRight size={12} />
          </div>
        </Link>

        {user.role !== "reseller" && user.role !== "admin" ? (
          <Link href="/dashboard/become-reseller" className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Reseller Program
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--warning)" }}>
                  Become a Reseller
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}
              >
                <Store size={24} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: "var(--warning)" }}>
              <span>Learn more</span>
              <ArrowRight size={12} />
            </div>
          </Link>
        ) : (
          <Link href="/reseller" className="stat-card group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  Reseller Dashboard
                </p>
                <p className="text-lg font-bold mt-1" style={{ color: "var(--warning)" }}>
                  Manage Store
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}
              >
                <Store size={24} />
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/products"
          className="btn-3d btn-primary py-4 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} /> Buy Data Now
        </Link>
        <Link
          href="/dashboard/wallet"
          className="btn-3d btn-outline py-4 flex items-center justify-center gap-2"
        >
          <Wallet size={18} /> Fund Wallet
        </Link>
        <Link
          href="/dashboard/orders"
          className="btn-3d btn-outline py-4 flex items-center justify-center gap-2"
        >
          <Clock size={18} /> Order History
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="card-flat overflow-hidden">
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>
            Recent Orders
          </h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-medium"
            style={{ color: "var(--accent)" }}
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className="spinner" style={{ color: "var(--accent)" }} />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.productName}</td>
                    <td>{order.phoneNumber}</td>
                    <td className="font-semibold">GHS {parseFloat(order.amount).toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "completed"
                            ? "badge-success"
                            : order.status === "failed"
                            ? "badge-danger"
                            : order.status === "processing"
                            ? "badge-info"
                            : "badge-warning"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShoppingBag
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--text-muted)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>No orders yet</p>
            <Link
              href="/products"
              className="text-sm font-medium mt-2 inline-block"
              style={{ color: "var(--accent)" }}
            >
              Buy your first bundle →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
