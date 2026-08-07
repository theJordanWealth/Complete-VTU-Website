"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Store,
  CreditCard,
  Settings,
  ArrowLeft,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeSlug, setStoreSlug] = useState("");

  useEffect(() => {
    if (!loading && (!user || (user.role !== "reseller" && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    fetch("/api/reseller/store")
      .then((r) => r.json())
      .then((data) => {
        if (data.store?.storeSlug) setStoreSlug(data.store.storeSlug);
      })
      .catch(() => {});
  }, []);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  const navItems = [
    { href: "/reseller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reseller/orders", label: "Orders", icon: ShoppingBag },
    { href: "/reseller/customers", label: "Customers", icon: Users },
    { href: "/reseller/store", label: "Store Settings", icon: Store },
    { href: "/reseller/withdrawals", label: "Withdrawals", icon: CreditCard },
    { href: "/reseller/pricing", label: "Custom Pricing", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:block w-64 sidebar fixed top-0 left-0 pt-4 z-30">
        <div className="px-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "var(--gradient-primary)" }}>
              <Store size={20} />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Reseller Panel</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user.name}</p>
            </div>
          </div>
        </div>

        <nav className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? "active" : ""}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        {storeSlug && (
          <div className="px-4 py-2">
            <a href={`/store/${storeSlug}`} target="_blank" className="sidebar-link text-[var(--accent)]">
              <ExternalLink size={18} /> View My Store
            </a>
          </div>
        )}

        <div className="px-4 py-4 border-t" style={{ borderColor: "var(--border)" }}>
          <Link href="/" className="sidebar-link"><ArrowLeft size={18} /> Back to Site</Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 sidebar">
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Reseller Panel</span>
              <button onClick={() => setSidebarOpen(false)}><X size={20} style={{ color: "var(--text-secondary)" }} /></button>
            </div>
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
                  <item.icon size={18} /> {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden sticky top-16 z-20 flex items-center gap-3 px-4 py-3 border-b" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu size={20} style={{ color: "var(--text-primary)" }} />
          </button>
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>Reseller Panel</span>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
