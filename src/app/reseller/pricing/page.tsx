"use client";
import { useEffect, useState } from "react";
import { useSettings } from "@/components/SettingsProvider";
import { Settings, Save } from "lucide-react";

interface Product {
  id: string;
  name: string;
  network: string;
  dataAmount: string;
  price: string;
}

interface CustomPrice {
  productId: string;
  customPrice: string;
}

export default function ResellerPricingPage() {
  const settings = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [customPrices, setCustomPrices] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/reseller/store").then((r) => r.json()),
    ]).then(([prodData, storeData]) => {
      setProducts(prodData.products || []);

      const priceMap = new Map<string, string>();
      if (storeData.customPrices) {
        for (const cp of storeData.customPrices) {
          priceMap.set(cp.productId, cp.customPrice);
        }
      }
      setCustomPrices(priceMap);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSavePrice = async (productId: string) => {
    setSaving(productId);
    try {
      const price = customPrices.get(productId);
      if (!price) return;

      await fetch("/api/reseller/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, customPrice: parseFloat(price) }),
      });
    } catch (err) {
      alert("Failed to save price");
    } finally {
      setSaving(null);
    }
  };

  const updatePrice = (productId: string, price: string) => {
    const newMap = new Map(customPrices);
    newMap.set(productId, price);
    setCustomPrices(newMap);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Custom Pricing</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Set custom prices for products on your storefront. Add your profit margin on top of the default price.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => {
            const defaultPrice = parseFloat(p.price);
            const customPrice = customPrices.get(p.id) || p.price;

            return (
              <div key={p.id} className="card-flat p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${
                      p.network === "MTN" ? "badge-warning" :
                      p.network === "Vodafone" ? "badge-danger" : "badge-info"
                    }`}>
                      {p.network}
                    </span>
                    <span className="font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {p.dataAmount} • Default: {settings.currency} {defaultPrice.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: "var(--text-muted)" }}>Your Price ({settings.currency})</label>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => updatePrice(p.id, e.target.value)}
                      className="input-field w-32 text-center"
                      step="0.5"
                      min={defaultPrice}
                    />
                  </div>
                  {parseFloat(customPrice) > defaultPrice && (
                    <div className="text-center">
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Profit</p>
                      <p className="font-bold text-sm" style={{ color: "var(--success)" }}>
                        +{settings.currency} {(parseFloat(customPrice) - defaultPrice).toFixed(2)}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => handleSavePrice(p.id)}
                    disabled={saving === p.id}
                    className="btn-3d btn-primary px-4 py-3"
                  >
                    {saving === p.id ? <span className="spinner" /> : <Save size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
