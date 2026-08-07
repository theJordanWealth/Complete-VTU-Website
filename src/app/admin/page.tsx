"use client";
import { useEffect, useState } from "react";
import {
  Users,
  ShoppingBag,
  Package,
  Store,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: string;
  totalProfit: string;
  totalProducts: number;
  totalResellers: number;
  totalDeposits: string;
  todayOrders: number;
  todayRevenue: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
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

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "var(--accent)",
      bg: "rgba(124, 58, 237, 0.1)",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBag,
      color: "var(--info)",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      label: "Total Revenue",
      value: `GHS ${parseFloat(stats?.totalRevenue || "0").toFixed(2)}`,
      icon: DollarSign,
      color: "var(--success)",
      bg: "rgba(16, 185, 129, 0.1)",
    },
    {
      label: "Total Profit",
      value: `GHS ${parseFloat(stats?.totalProfit || "0").toFixed(2)}`,
      icon: TrendingUp,
      color: "var(--warning)",
      bg: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "var(--accent)",
      bg: "rgba(124, 58, 237, 0.1)",
    },
    {
      label: "Resellers",
      value: stats?.totalResellers || 0,
      icon: Store,
      color: "var(--info)",
      bg: "rgba(59, 130, 246, 0.1)",
    },
    {
      label: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: Calendar,
      color: "var(--success)",
      bg: "rgba(16, 185, 129, 0.1)",
    },
    {
      label: "Today's Revenue",
      value: `GHS ${parseFloat(stats?.todayRevenue || "0").toFixed(2)}`,
      icon: BarChart3,
      color: "var(--warning)",
      bg: "rgba(245, 158, 11, 0.1)",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Overview of your platform
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {card.label}
              </span>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: card.bg, color: card.color }}
              >
                <card.icon size={20} />
              </div>
            </div>
            <p
              className="text-2xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
