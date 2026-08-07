"use client";
import { useEffect, useState } from "react";
import { Users } from "lucide-react";

interface Customer {
  id: string;
  phone: string;
  whatsappNumber: string;
  totalOrders: number;
  totalSpent: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export default function ResellerCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reseller/customers")
      .then((r) => r.json())
      .then((data) => {
        setCustomers(data.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Customers</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>People who bought from your store</p>
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : customers.length > 0 ? (
        <div className="card-flat overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>WhatsApp</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Since</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{c.userName || "Anonymous"}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.userEmail}</p>
                      </div>
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.whatsappNumber || "—"}</td>
                    <td className="font-semibold">{c.totalOrders}</td>
                    <td className="font-semibold" style={{ color: "var(--success)" }}>GHS {parseFloat(c.totalSpent).toFixed(2)}</td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)" }}>No customers yet</p>
        </div>
      )}
    </div>
  );
}
