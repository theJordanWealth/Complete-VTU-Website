"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useSettings } from "@/components/SettingsProvider";
import { Smartphone, Wifi, Clock, ShoppingCart, CheckCircle, AlertCircle } from "lucide-react";

interface Product {
  id: string;
  name: string;
  network: string;
  dataAmount: string;
  validity: string;
  price: string;
  agentPrice: string;
  description: string;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const settings = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderResult, setOrderResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all"
      ? products
      : products.filter((p) => p.network?.toLowerCase() === filter);

  const handleBuy = async () => {
    if (!selectedProduct || !phone) return;
    setBuying(selectedProduct.id);
    setOrderResult(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          phoneNumber: phone,
          isGuest: !user,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOrderResult({
          success: true,
          message: data.message || "Order placed successfully!",
        });
        setSelectedProduct(null);
        setPhone("");
      } else {
        setOrderResult({ success: false, message: data.error });
      }
    } catch (err) {
      setOrderResult({ success: false, message: "Failed to place order" });
    } finally {
      setBuying(null);
    }
  };

  const getPrice = (product: Product) => {
    if (user?.isAgent && product.agentPrice) {
      return parseFloat(product.agentPrice);
    }
    return parseFloat(product.price);
  };

  const networks = ["all", "mtn", "vodafone", "airteltigo"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Buy Data Bundles
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Select a data bundle and get instant delivery
        </p>
        {user?.isAgent && (
          <span className="badge badge-purple mt-2">
            🌟 Agent pricing active
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {networks.map((n) => (
          <button
            key={n}
            onClick={() => setFilter(n)}
            className={`tab-btn ${filter === n ? "active" : ""}`}
          >
            {n === "all" ? "All Networks" : n.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Order Result */}
      {orderResult && (
        <div
          className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            orderResult.success
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-red-500/10 border border-red-500/20"
          }`}
        >
          {orderResult.success ? (
            <CheckCircle className="text-green-500 shrink-0" size={20} />
          ) : (
            <AlertCircle className="text-red-500 shrink-0" size={20} />
          )}
          <span
            className={orderResult.success ? "text-green-600" : "text-red-500"}
          >
            {orderResult.message}
          </span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <span className="spinner mx-auto" style={{ color: "var(--accent)" }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="card p-6 group">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`badge ${
                    product.network === "MTN"
                      ? "badge-warning"
                      : product.network === "Vodafone"
                      ? "badge-danger"
                      : "badge-info"
                  }`}
                >
                  {product.network}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: "rgba(124, 58, 237, 0.1)",
                    color: "var(--accent)",
                  }}
                >
                  <Smartphone size={20} />
                </div>
              </div>

              <h3
                className="text-2xl font-black mb-1"
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

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Wifi size={14} style={{ color: "var(--accent)" }} />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {product.dataAmount}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} style={{ color: "var(--accent)" }} />
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {product.validity}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="text-2xl font-black"
                    style={{ color: "var(--accent)" }}
                  >
                    {settings.currency} {getPrice(product).toFixed(2)}
                  </span>
                  {user?.isAgent &&
                    product.agentPrice &&
                    parseFloat(product.agentPrice) < parseFloat(product.price) && (
                      <span
                        className="block text-xs line-through"
                        style={{ color: "var(--text-muted)" }}
                      >
                        GHS {parseFloat(product.price).toFixed(2)}
                      </span>
                    )}
                </div>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="btn-3d btn-primary text-sm px-4 py-2 flex items-center gap-1"
                >
                  <ShoppingCart size={14} /> Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-20">
          <Smartphone
            size={48}
            className="mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>
            No data bundles available for this network
          </p>
        </div>
      )}

      {/* Buy Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Buy {selectedProduct.name}
            </h2>

            <div className="card-flat p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Network</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {selectedProduct.network}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Data</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {selectedProduct.dataAmount}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Validity</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                  {selectedProduct.validity}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Price</span>
                <span className="font-bold text-lg" style={{ color: "var(--accent)" }}>
                  GHS {getPrice(selectedProduct).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Phone Number (Data Recipient)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="+233XXXXXXXXX"
                required
              />
            </div>

            {!user && (
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                You can checkout as a guest. For wallet balance and order history,{" "}
                <a href="/register" style={{ color: "var(--accent)" }}>
                  create an account
                </a>
                .
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedProduct(null)}
                className="btn-3d btn-outline flex-1 py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleBuy}
                disabled={!phone || !!buying}
                className="btn-3d btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                {buying ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <ShoppingCart size={16} /> Pay GHS{" "}
                    {getPrice(selectedProduct).toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
