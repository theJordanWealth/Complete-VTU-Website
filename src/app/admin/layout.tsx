"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Store,
  Bell,
  Settings,
  CreditCard,
  Menu,
  X,
  Server,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/providers", label: "Providers", icon: Server },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/resellers", label: "Resellers", icon: Store },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: CreditCard },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-64 sidebar fixed top-0 left-0 pt-4 z-30">
        <div className="px-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: "var(--gradient-primary)" }}
            >
              A
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                Admin Panel
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {user.name}
              </p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                pathname === item.href ? "active" : ""
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="sidebar-link">
            <ArrowLeft size={18} /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 sidebar">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  A
                </div>
                <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                  Admin Panel
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-link ${
                    pathname === item.href ? "active" : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div
          className="lg:hidden sticky top-16 z-20 flex items-center gap-3 px-4 py-3 border-b"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu size={20} style={{ color: "var(--text-primary)" }} />
          </button>
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
            Admin Panel
          </span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
