"use client";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  productName: string;
  amount: string;
  status: string;
  createdAt: string;
  phoneNumber: string;
  dataAmount: string;
  validity: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        My Orders
      </h1>

      {loading ? (
        <div className="text-center py-20">
          <span className="spinner" style={{ color: "var(--accent)" }} />
        </div>
      ) : orders.length > 0 ? (
        <div className="card-flat overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Data</th>
                  <th>Phone</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.productName}</td>
                    <td>
                      {order.dataAmount} • {order.validity}
                    </td>
                    <td>{order.phoneNumber}</td>
                    <td className="font-semibold">
                      GHS {parseFloat(order.amount).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          order.status === "completed"
                            ? "badge-success"
                            : order.status === "failed"
                            ? "badge-danger"
                            : order.status === "processing"
                            ? "badge-info"
                            : "badge-warning"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <ShoppingBag
            size={48}
            className="mx-auto mb-4"
            style={{ color: "var(--text-muted)" }}
          />
          <p style={{ color: "var(--text-secondary)" }}>No orders yet</p>
        </div>
      )}
    </div>
  );
}
