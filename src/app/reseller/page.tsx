"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  Store,
  CreditCard,
  ExternalLink,
} from "lucide-react";

interface DashboardData {
  store: { storeName: string; storeSlug: string };
  walletBalance: string;
  stats: {
    totalOrders: number;
    totalRevenue: string;
    totalProfit: string;
    todayOrders: number;
    todayRevenue: string;
    customerCount: number;
    totalWithdrawn: string;
    pendingWithdrawal: string;
    availableBalance: string;
  };
  minWithdrawal: string;
  recentOrders: Array<{
    id: string;
    productName: string;
    phoneNumber: string;
    amount: string;
    profit: string;
    status: string;
    createdAt: string;
  }>;
}

export default function ResellerDashboard() {
  const settings = useSettings();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reseller/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <Store size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
        <p style={{ color: "var(--text-secondary)" }}>Store not found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {data.store.storeName} 📊
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Your reseller dashboard overview
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/store/${data.store.storeSlug}`}
            target="_blank"
            className="btn-3d btn-outline text-sm px-4 py-2 flex items-center gap-1"
          >
            <ExternalLink size={14} /> View Store
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Available Balance</p>
              <p className="text-2xl font-black mt-1" style={{ color: "var(--success)" }}>
                GHS {parseFloat(data.stats.availableBalance).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Revenue</p>
              <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                GHS {parseFloat(data.stats.totalRevenue).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--info)" }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Profit</p>
              <p className="text-2xl font-black mt-1" style={{ color: "var(--accent)" }}>
                GHS {parseFloat(data.stats.totalProfit).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)", color: "var(--accent)" }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Orders</p>
              <p className="text-2xl font-black mt-1" style={{ color: "var(--text-primary)" }}>
                {data.stats.totalOrders}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" }}>
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card-flat p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Today&apos;s Orders</p>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{data.stats.todayOrders}</p>
          </div>
        </div>
        <div className="card-flat p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--info)" }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Today&apos;s Revenue</p>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>GHS {parseFloat(data.stats.todayRevenue).toFixed(2)}</p>
          </div>
        </div>
        <div className="card-flat p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)", color: "var(--accent)" }}>
            <Users size={20} />
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Customers</p>
            <p className="font-bold" style={{ color: "var(--text-primary)" }}>{data.stats.customerCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link href="/reseller/withdrawals" className="btn-3d btn-primary py-4 flex items-center justify-center gap-2">
          <CreditCard size={18} /> Request Withdrawal
        </Link>
        <Link href="/reseller/store" className="btn-3d btn-outline py-4 flex items-center justify-center gap-2">
          <Store size={18} /> Store Settings
        </Link>
        <Link href="/reseller/customers" className="btn-3d btn-outline py-4 flex items-center justify-center gap-2">
          <Users size={18} /> View Customers
        </Link>
      </div>

      {/* Notice */}
      <div className="p-4 rounded-xl mb-8" style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
        <p className="text-sm" style={{ color: "var(--warning)" }}>
          💡 <strong>Notice:</strong> Earnings will be sent in the next business day after withdrawal is placed. Minimum withdrawal: GHS {parseFloat(data.minWithdrawal).toFixed(2)}.
        </p>
      </div>

      {/* Recent Orders */}
      <div className="card-flat overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Recent Orders</h2>
          <Link href="/reseller/orders" className="text-sm font-medium" style={{ color: "var(--accent)" }}>View All →</Link>
        </div>
        {data.recentOrders?.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="font-medium">{o.productName}</td>
                    <td>{o.phoneNumber}</td>
                    <td className="font-semibold">GHS {parseFloat(o.amount).toFixed(2)}</td>
                    <td style={{ color: "var(--success)" }}>+GHS {parseFloat(o.profit || "0").toFixed(2)}</td>
                    <td>
                      <span className={`badge ${o.status === "completed" ? "badge-success" : o.status === "failed" ? "badge-danger" : "badge-warning"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <ShoppingBag size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No orders yet. Share your store link!</p>
          </div>
        )}
      </div>
    </div>
  );
}
