"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Store, Save, Copy, ExternalLink, Check } from "lucide-react";

export default function ResellerStoreSettingsPage() {
  const { user } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    storeName: "",
    description: "",
    whatsappNumber: "",
  });

  useEffect(() => {
    fetch("/api/reseller/store")
      .then((r) => r.json())
      .then((data) => {
        if (data.store) {
          setStore(data.store);
          setForm({
            storeName: data.store.storeName || "",
            description: data.store.description || "",
            whatsappNumber: data.store.whatsappNumber || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/reseller/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.store) setStore(data.store);
    } catch (err) {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const storeUrl = store ? `${typeof window !== "undefined" ? window.location.origin : ""}/store/${store.storeSlug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Store Settings</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Customize your storefront</p>
      </div>

      {/* Store Link */}
      {store && (
        <div className="card-flat p-5 mb-6">
          <h3 className="font-bold mb-3" style={{ color: "var(--text-primary)" }}>Your Store Link</h3>
          <div className="flex items-center gap-2">
            <input type="text" value={storeUrl} readOnly className="input-field flex-1 text-sm" />
            <button onClick={copyLink} className="btn-3d btn-outline px-4 py-3 flex items-center gap-2 shrink-0">
              {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
            </button>
            <a href={`/store/${store.storeSlug}`} target="_blank" className="btn-3d btn-primary px-4 py-3 shrink-0">
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            Share this link with your customers to buy data from your store
          </p>
        </div>
      )}

      {/* Store Settings Form */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)", color: "var(--accent)" }}>
            <Store size={20} />
          </div>
          <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Store Details</h2>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Store Name</label>
          <input type="text" value={form.storeName} onChange={(e) => setForm({...form, storeName: e.target.value})} className="input-field" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input-field" rows={3} placeholder="Tell customers about your store..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>WhatsApp Number</label>
          <input type="tel" value={form.whatsappNumber} onChange={(e) => setForm({...form, whatsappNumber: e.target.value})} className="input-field" placeholder="+233XXXXXXXXX" />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            This number will show on the WhatsApp button on your storefront
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-3d btn-primary w-full py-3 flex items-center justify-center gap-2">
          {saving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
        </button>
      </div>
    </div>
  );
}
