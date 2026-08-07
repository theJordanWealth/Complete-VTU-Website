"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Settings, Save, Globe, CreditCard, Smartphone } from "lucide-react";

interface SiteSettings {
  siteName: string;
  siteLogo: string;
  tagline: string;
  whatsappNumber: string;
  currency: string;
  minWithdrawal: string;
  koraPublicKey: string;
  koraSecretKey: string;
  koraBaseUrl: string;
  paystackPublicKey: string;
  paystackSecretKey: string;
  paystackEnabled: boolean;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data.settings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await apiFetch("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="spinner" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Site Settings</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Configure your website</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-3d btn-primary px-6 py-2 flex items-center gap-2">
          {saving ? <span className="spinner" /> : <><Save size={16} /> {saved ? "Saved!" : "Save Changes"}</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)", color: "var(--accent)" }}>
              <Globe size={20} />
            </div>
            <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>General</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Site Name</label>
              <input type="text" value={settings.siteName || ""} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Tagline</label>
              <input type="text" value={settings.tagline || ""} onChange={(e) => setSettings({...settings, tagline: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Logo URL</label>
              <input type="text" value={settings.siteLogo || ""} onChange={(e) => setSettings({...settings, siteLogo: e.target.value})} className="input-field" placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>WhatsApp Number</label>
              <input type="tel" value={settings.whatsappNumber || ""} onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})} className="input-field" placeholder="+233XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Minimum Withdrawal (GHS)</label>
              <input type="number" value={settings.minWithdrawal || "10"} onChange={(e) => setSettings({...settings, minWithdrawal: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>

        {/* Kora Pay Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--info)" }}>
              <CreditCard size={20} />
            </div>
            <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Kora Pay (Primary)</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Public Key</label>
              <input type="text" value={settings.koraPublicKey || ""} onChange={(e) => setSettings({...settings, koraPublicKey: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Secret Key</label>
              <input type="password" value={settings.koraSecretKey || ""} onChange={(e) => setSettings({...settings, koraSecretKey: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Base URL</label>
              <input type="text" value={settings.koraBaseUrl || ""} onChange={(e) => setSettings({...settings, koraBaseUrl: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>

        {/* Paystack Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" }}>
              <Smartphone size={20} />
            </div>
            <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>Paystack (Optional)</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Enable Paystack</label>
              <button
                onClick={() => setSettings({...settings, paystackEnabled: !settings.paystackEnabled})}
                className={`w-12 h-6 rounded-full transition-all ${settings.paystackEnabled ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.paystackEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Public Key</label>
              <input type="text" value={settings.paystackPublicKey || ""} onChange={(e) => setSettings({...settings, paystackPublicKey: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>Secret Key</label>
              <input type="password" value={settings.paystackSecretKey || ""} onChange={(e) => setSettings({...settings, paystackSecretKey: e.target.value})} className="input-field" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
