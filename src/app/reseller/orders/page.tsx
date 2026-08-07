"use client";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  productName: string;
  phoneNumber: string;
  amount: string;
  profit: string;
  status: string;
  userName: string;
  userPhone: string;
  userWhatsapp: string;
  createdAt: string;
}

export default function ResellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reseller/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Orders</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>All orders from your storefront</p>
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : orders.length > 0 ? (
        <div className="card-flat overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Your Profit</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{o.userName || "Guest"}</p>
                        {o.userWhatsapp && <p className="text-xs" style={{ color: "var(--text-muted)" }}>WA: {o.userWhatsapp}</p>}
                      </div>
                    </td>
                    <td>{o.productName}</td>
                    <td>{o.phoneNumber}</td>
                    <td className="font-semibold">GHS {parseFloat(o.amount).toFixed(2)}</td>
                    <td className="font-semibold" style={{ color: "var(--success)" }}>+GHS {parseFloat(o.profit || "0").toFixed(2)}</td>
                    <td>
                      <span className={`badge ${o.status === "completed" ? "badge-success" : o.status === "failed" ? "badge-danger" : "badge-warning"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>{new Date(o.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)" }}>No orders yet</p>
        </div>
      )}
    </div>
  );
}
