"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Store, Users, TrendingUp, DollarSign, ExternalLink, Eye, EyeOff } from "lucide-react";

interface Reseller {
  id: string;
  userId: string;
  storeName: string;
  storeSlug: string;
  whatsappNumber: string;
  isActive: boolean;
  createdAt: string;
  userName: string;
  userEmail: string;
  stats: {
    totalOrders: number;
    totalRevenue: string;
    totalProfit: string;
    pendingWithdrawals: string;
    customerCount: number;
  };
}

export default function AdminResellersPage() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResellers = () => {
    fetch("/api/admin/resellers")
      .then((r) => r.json())
      .then((data) => {
        setResellers(data.resellers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchResellers(); }, []);

  const toggleActive = async (storeId: string) => {
    try {
      await apiFetch("/api/admin/resellers", {
        method: "PUT",
        body: JSON.stringify({ storeId, action: "toggle_active" }),
      });
      fetchResellers();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reseller Hub</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Monitor and manage all reseller storefronts</p>
      </div>

      {/* Summary Stats */}
      {resellers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Resellers</p>
            <p className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>{resellers.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Revenue</p>
            <p className="text-2xl font-black" style={{ color: "var(--success)" }}>
              GHS {resellers.reduce((sum, r) => sum + parseFloat(r.stats?.totalRevenue || "0"), 0).toFixed(2)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Orders</p>
            <p className="text-2xl font-black" style={{ color: "var(--info)" }}>
              {resellers.reduce((sum, r) => sum + (r.stats?.totalOrders || 0), 0)}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Customers</p>
            <p className="text-2xl font-black" style={{ color: "var(--accent)" }}>
              {resellers.reduce((sum, r) => sum + (r.stats?.customerCount || 0), 0)}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resellers.map((r) => (
            <div key={r.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(124, 58, 237, 0.1)", color: "var(--accent)" }}>
                    <Store size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{r.storeName}</h3>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>by {r.userName} ({r.userEmail})</p>
                  </div>
                </div>
                <button onClick={() => toggleActive(r.id)} className={`badge cursor-pointer ${r.isActive ? "badge-success" : "badge-danger"}`}>
                  {r.isActive ? "Active" : "Disabled"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Orders</p>
                  <p className="font-bold" style={{ color: "var(--text-primary)" }}>{r.stats?.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Revenue</p>
                  <p className="font-bold" style={{ color: "var(--success)" }}>GHS {parseFloat(r.stats?.totalRevenue || "0").toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Customers</p>
                  <p className="font-bold" style={{ color: "var(--info)" }}>{r.stats?.customerCount || 0}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Pending Payouts</p>
                  <p className="font-bold" style={{ color: "var(--warning)" }}>GHS {parseFloat(r.stats?.pendingWithdrawals || "0").toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/store/${r.storeSlug}`}
                  target="_blank"
                  className="btn-3d btn-outline flex-1 py-2 text-sm flex items-center justify-center gap-1"
                >
                  <ExternalLink size={14} /> View Store
                </a>
              </div>
            </div>
          ))}

          {resellers.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <Store size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)" }}>No resellers yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
