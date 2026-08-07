"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Smartphone,
  Wifi,
  Clock,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Star,
  ArrowRight,
  Store,
} from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

interface StoreData {
  store: {
    id: string;
    storeName: string;
    storeSlug: string;
    description: string;
    whatsappNumber: string;
    logoUrl: string;
    ownerName: string;
  };
  products: Array<{
    id: string;
    name: string;
    network: string;
    dataAmount: string;
    validity: string;
    price: string;
    description: string;
  }>;
}

export default function StoreFrontPage() {
  const params = useParams();
  const slug = params.slug as string;
  const siteSettings = useSettings();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [buying, setBuying] = useState(false);
  const [orderResult, setOrderResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (slug) {
      fetch(`/api/store/${slug}`)
        .then((r) => r.json())
        .then((data) => {
          setStoreData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [slug]);

  const handleBuy = async () => {
    if (!selectedProduct || !phone) return;
    setBuying(true);
    setOrderResult(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          phoneNumber: phone,
          isGuest: true,
          resellerSlug: slug,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOrderResult({ success: true, message: data.message || "Order placed!" });
        setSelectedProduct(null);
        setPhone("");
      } else {
        setOrderResult({ success: false, message: data.error });
      }
    } catch (err) {
      setOrderResult({ success: false, message: "Failed to place order" });
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <span className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (!storeData?.store) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <Store size={64} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Store Not Found</h1>
          <p style={{ color: "var(--text-secondary)" }}>This store may have been deactivated.</p>
          <Link href="/" className="btn-3d btn-primary mt-4 inline-block">Go Home</Link>
        </div>
      </div>
    );
  }

  const { store, products } = storeData;
  const networks = ["all", "mtn", "vodafone", "airteltigo"];
  const filtered = filter === "all" ? products : products.filter((p) => p.network?.toLowerCase() === filter);

  const cleanWp = store.whatsappNumber?.replace(/[^0-9]/g, "");

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Store Hero */}
      <section className="relative overflow-hidden py-16" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-10 bg-purple-400 animate-pulse" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-10 bg-blue-400 animate-pulse" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black glass">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.storeName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              store.storeName.charAt(0)
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{store.storeName}</h1>
          {store.description && (
            <p className="text-white/70 mb-2 max-w-xl mx-auto">{store.description}</p>
          )}
          <p className="text-white/50 text-sm mb-6">by {store.ownerName}</p>

          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-white/60 text-sm">Trusted Seller</span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-10">
        {/* Order Result */}
        {orderResult && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
            orderResult.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
          }`}>
            {orderResult.success ? <CheckCircle className="text-green-500 shrink-0" size={20} /> : <AlertCircle className="text-red-500 shrink-0" size={20} />}
            <span className={orderResult.success ? "text-green-600" : "text-red-500"}>{orderResult.message}</span>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8 mt-4">
          {networks.map((n) => (
            <button key={n} onClick={() => setFilter(n)} className={`tab-btn ${filter === n ? "active" : ""}`}>
              {n === "all" ? "All Networks" : n.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filtered.map((product) => (
            <div key={product.id} className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`badge ${
                  product.network === "MTN" ? "badge-warning" :
                  product.network === "Vodafone" ? "badge-danger" : "badge-info"
                }`}>
                  {product.network}
                </span>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)", color: "var(--accent)" }}>
                  <Smartphone size={20} />
                </div>
              </div>

              <h3 className="text-xl font-black mb-1" style={{ color: "var(--text-primary)" }}>{product.dataAmount}</h3>
              <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>{product.name}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <Wifi size={14} style={{ color: "var(--accent)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{product.dataAmount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} style={{ color: "var(--accent)" }} />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>{product.validity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-2xl font-black" style={{ color: "var(--accent)" }}>
                  {siteSettings.currency} {parseFloat(product.price).toFixed(2)}
                </span>
                <button onClick={() => setSelectedProduct(product)} className="btn-3d btn-primary text-sm px-4 py-2 flex items-center gap-1">
                  <ShoppingCart size={14} /> Buy
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Smartphone size={48} className="mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-secondary)" }}>No products available for this network</p>
          </div>
        )}
      </div>

      {/* Store Footer */}
      <footer className="py-8 border-t text-center" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Powered by <span className="font-bold" style={{ color: "var(--accent)" }}>{siteSettings.siteName}</span>
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} {store.storeName}
        </p>
      </footer>

      {/* WhatsApp Button for Store */}
      {store.whatsappNumber && (
        <a
          href={`https://wa.me/${cleanWp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </a>
      )}

      {/* Buy Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Buy {selectedProduct.name}
            </h2>
            <div className="card-flat p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Network</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selectedProduct.network}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Data</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selectedProduct.dataAmount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: "var(--text-secondary)" }}>Validity</span>
                <span className="font-medium" style={{ color: "var(--text-primary)" }}>{selectedProduct.validity}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--text-secondary)" }}>Price</span>
                <span className="font-bold text-lg" style={{ color: "var(--accent)" }}>
                  {siteSettings.currency} {parseFloat(selectedProduct.price).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Phone Number (Data Recipient)
              </label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="+233XXXXXXXXX" />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedProduct(null)} className="btn-3d btn-outline flex-1 py-3">Cancel</button>
              <button onClick={handleBuy} disabled={!phone || buying} className="btn-3d btn-primary flex-1 py-3 flex items-center justify-center gap-2">
                {buying ? <span className="spinner" /> : <><ShoppingCart size={16} /> Buy Now</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
