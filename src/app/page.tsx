"use client";
import Link from "next/link";
import { useSettings } from "@/components/SettingsProvider";
import {
  Zap,
  Shield,
  Clock,
  Smartphone,
  ArrowRight,
  Users,
  TrendingUp,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  network: string;
  dataAmount: string;
  validity: string;
  price: string;
}

export default function HomePage() {
  const settings = useSettings();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => setProducts(data.products?.slice(0, 6) || []))
      .catch(() => {});
  }, []);

  const networks = [
    { name: "MTN", color: "#FFCC00", bg: "bg-yellow-400" },
    { name: "Vodafone", color: "#E60000", bg: "bg-red-500" },
    { name: "AirtelTigo", color: "#FF0000", bg: "bg-red-600" },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-20 lg:py-32"
        style={{ background: "var(--gradient-hero)" }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 bg-purple-400 animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10 bg-blue-400 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5 bg-white" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Zap size={14} className="text-yellow-300" />
            <span className="text-white/80 text-xs font-medium">
              #1 Data Bundle Platform in Ghana
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {settings.siteName}
            <br />
            <span className="text-purple-300">{settings.tagline}</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Get instant data bundles for MTN, Vodafone, and AirtelTigo at the
            cheapest prices in Ghana. Fast delivery, 24/7 service.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="btn-3d btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2"
            >
              Buy Data Now
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/register"
              className="btn-3d btn-outline text-lg px-8 py-4 text-white border-white/30 hover:bg-white hover:text-[var(--accent-dark)]"
            >
              Become a Reseller
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { label: "Happy Users", value: "10K+", icon: Users },
              { label: "Orders Today", value: "500+", icon: TrendingUp },
              { label: "Rating", value: "4.9", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto mb-2 text-purple-300" size={20} />
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <section className="py-16" style={{ background: "var(--bg-primary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              All Networks Supported
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Buy data for any network in Ghana instantly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {networks.map((net) => (
              <div key={net.name} className="card p-6 text-center">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-xl font-bold"
                  style={{ background: net.color }}
                >
                  {net.name.charAt(0)}
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {net.name}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Instant data delivery for {net.name} network
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ background: "var(--bg-secondary)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Why Choose {settings.siteName}?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Instant Delivery",
                desc: "Data is delivered within seconds of payment",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Pay safely with mobile money or card",
              },
              {
                icon: Clock,
                title: "24/7 Available",
                desc: "Buy data anytime, anywhere in Ghana",
              },
              {
                icon: Smartphone,
                title: "All Networks",
                desc: "MTN, Vodafone, AirtelTigo supported",
              },
            ].map((feat) => (
              <div key={feat.title} className="stat-card text-center">
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: "rgba(124, 58, 237, 0.1)",
                    color: "var(--accent)",
                  }}
                >
                  <feat.icon size={24} />
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  {feat.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      {products.length > 0 && (
        <section className="py-16" style={{ background: "var(--bg-primary)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2
                className="text-3xl font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Popular Data Bundles
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Best selling data bundles this week
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="badge badge-info">{product.network}</span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {product.validity}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {product.dataAmount}
                  </h3>
                  <p
                    className="text-sm mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {product.name}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-2xl font-black"
                      style={{ color: "var(--accent)" }}
                    >
                      GHS {parseFloat(product.price).toFixed(2)}
                    </span>
                    <Link
                      href="/products"
                      className="btn-3d btn-primary text-sm px-4 py-2"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/products"
                className="btn-3d btn-outline inline-flex items-center gap-2"
              >
                View All Bundles
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section
        className="py-20"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Start Reselling Data Today
          </h2>
          <p className="text-white/70 mb-8">
            Create your own data store, set your own prices, and earn money
            selling data bundles to customers across Ghana.
          </p>
          <Link
            href="/register"
            className="btn-3d btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 border-t"
        style={{
          background: "var(--bg-secondary)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              {settings.siteName.charAt(0)}
            </div>
            <span
              className="font-bold text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {settings.siteName}
            </span>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            {settings.tagline}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} {settings.siteName}. All rights
            reserved. Made with ❤️ in Ghana.
          </p>
        </div>
      </footer>
    </div>
  );
}
