"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { Store, CheckCircle, ArrowRight } from "lucide-react";

export default function BecomeResellerPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reseller/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, description, whatsappNumber }),
      });
      const data = await res.json();

      if (data.success) {
        await refreshUser();
        router.push("/reseller");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "Create your own branded storefront",
    "Set custom prices for your customers",
    "Track all orders and customers",
    "Manage withdrawals from your earnings",
    "Share your store link to attract buyers",
    "Real-time analytics and performance tracking",
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Store size={32} />
        </div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Become a Reseller
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Create your own data store and start earning today
        </p>
      </div>

      {/* Features */}
      <div className="card p-6 mb-8">
        <h2
          className="font-bold text-lg mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          What you get as a Reseller
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feat) => (
            <div key={feat} className="flex items-center gap-3">
              <CheckCircle size={16} style={{ color: "var(--success)" }} />
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {feat}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <h2
          className="font-bold text-lg"
          style={{ color: "var(--text-primary)" }}
        >
          Set Up Your Store
        </h2>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Store Name
          </label>
          <input
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="input-field"
            placeholder="e.g. Quick Data Store"
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Store Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            rows={3}
            placeholder="Tell customers about your store..."
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Store WhatsApp Number
          </label>
          <input
            type="tel"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            className="input-field"
            placeholder="+233XXXXXXXXX"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-3d btn-primary w-full py-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <Store size={18} /> Create My Store
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
