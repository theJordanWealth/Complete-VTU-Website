"use client";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useSettings } from "@/components/SettingsProvider";
import NotificationBell from "@/components/NotificationBell";
import {
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Wallet,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const settings = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const dashboardLink =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "reseller"
      ? "/reseller"
      : "/dashboard";

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{
        background: "var(--bg-secondary)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            {settings.siteLogo ? (
              <img
                src={settings.siteLogo}
                alt={settings.siteName}
                className="h-8 w-auto"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "var(--gradient-primary)" }}
              >
                {settings.siteName.charAt(0)}
              </div>
            )}
            <span
              className="font-bold text-lg hidden sm:inline"
              style={{ color: "var(--text-primary)" }}
            >
              {settings.siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium hover:text-[var(--accent)] transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Buy Data
            </Link>

            {user && <NotificationBell />}

            <button
              onClick={toggle}
              className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              {theme === "light" ? (
                <Moon size={18} style={{ color: "var(--text-secondary)" }} />
              ) : (
                <Sun size={18} style={{ color: "var(--text-secondary)" }} />
              )}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="text-sm font-medium hidden lg:inline"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.name}
                  </span>
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-12 w-56 rounded-xl border shadow-lg overflow-hidden"
                    style={{
                      background: "var(--bg-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {user.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href={dashboardLink}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <LayoutDashboard
                        size={16}
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Dashboard
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/wallet"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <Wallet
                        size={16}
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Wallet
                      </span>
                      <span
                        className="ml-auto text-xs font-semibold"
                        style={{ color: "var(--success)" }}
                      >
                        GHS {parseFloat(user.balance).toFixed(2)}
                      </span>
                    </Link>
                    <Link
                      href="/dashboard/orders"
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors"
                      onClick={() => setProfileOpen(false)}
                    >
                      <ShoppingBag
                        size={16}
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-primary)" }}
                      >
                        My Orders
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] transition-colors w-full text-left"
                    >
                      <LogOut
                        size={16}
                        style={{ color: "var(--danger)" }}
                      />
                      <span className="text-sm" style={{ color: "var(--danger)" }}>
                        Logout
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="btn-3d btn-outline text-sm px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="btn-3d btn-primary text-sm px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X size={24} style={{ color: "var(--text-primary)" }} />
            ) : (
              <Menu size={24} style={{ color: "var(--text-primary)" }} />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-col gap-2">
              <Link href="/" className="sidebar-link" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link href="/products" className="sidebar-link" onClick={() => setMenuOpen(false)}>
                <ShoppingBag size={16} /> Buy Data
              </Link>
              {user ? (
                <>
                  <Link href={dashboardLink} className="sidebar-link" onClick={() => setMenuOpen(false)}>
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link href="/dashboard/wallet" className="sidebar-link" onClick={() => setMenuOpen(false)}>
                    <Wallet size={16} /> Wallet (GHS {parseFloat(user.balance).toFixed(2)})
                  </Link>
                  <Link href="/dashboard/orders" className="sidebar-link" onClick={() => setMenuOpen(false)}>
                    <ShoppingBag size={16} /> My Orders
                  </Link>
                  <button onClick={() => { setMenuOpen(false); logout(); }} className="sidebar-link text-left" style={{ color: "var(--danger)" }}>
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="sidebar-link" onClick={() => setMenuOpen(false)}>
                    <User size={16} /> Login
                  </Link>
                  <Link href="/register" className="sidebar-link" onClick={() => setMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
              <div className="pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                <button onClick={toggle} className="sidebar-link w-full">
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
