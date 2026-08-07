"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { ShoppingBag, RefreshCw, Search } from "lucide-react";

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  productName: string;
  phoneNumber: string;
  network: string;
  amount: string;
  costAmount: string;
  profit: string;
  status: string;
  providerOrderId: string;
  providerResponse: unknown;
  isGuest: boolean;
  resellerStoreId: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resending, setResending] = useState<string | null>(null);

  const fetchOrders = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleResend = async (orderId: string) => {
    setResending(orderId);
    try {
      const data = await apiFetch("/api/admin/orders/resend", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });
      alert(data.message || "Order resent");
      fetchOrders();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    } finally {
      setResending(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await apiFetch("/api/admin/orders", {
        method: "PUT",
        body: JSON.stringify({ orderId, status }),
      });
      fetchOrders();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.userName?.toLowerCase().includes(search.toLowerCase()) ||
      o.phoneNumber?.includes(search) ||
      o.productName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Orders</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>View and manage all orders</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 w-48" placeholder="Search..." />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-36">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : (
        <div className="card-flat overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Product</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Profit</th>
                  <th>Status</th>
                  <th>Provider ID</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{o.userName || "Guest"}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{o.userEmail}</p>
                      </div>
                    </td>
                    <td className="font-medium">{o.productName}</td>
                    <td>{o.phoneNumber}</td>
                    <td className="font-semibold">GHS {parseFloat(o.amount).toFixed(2)}</td>
                    <td style={{ color: "var(--success)" }}>GHS {parseFloat(o.profit || "0").toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        o.status === "completed" ? "badge-success" :
                        o.status === "failed" ? "badge-danger" :
                        o.status === "processing" ? "badge-info" : "badge-warning"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                      {o.providerOrderId || "—"}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        {o.status === "failed" && (
                          <button
                            onClick={() => handleResend(o.id)}
                            disabled={resending === o.id}
                            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"
                            title="Resend to provider"
                          >
                            {resending === o.id ? (
                              <span className="spinner" />
                            ) : (
                              <RefreshCw size={14} style={{ color: "var(--accent)" }} />
                            )}
                          </button>
                        )}
                        {o.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, "completed")}
                            className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
