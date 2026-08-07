"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";

interface Withdrawal {
  id: string;
  amount: string;
  status: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  createdAt: string;
  processedAt: string;
  storeName: string;
  storeId: string;
  userName: string;
  userEmail: string;
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = () => {
    fetch("/api/admin/withdrawals")
      .then((r) => r.json())
      .then((data) => {
        setWithdrawals(data.withdrawals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const handleAction = async (withdrawalId: string, status: string) => {
    try {
      await apiFetch("/api/admin/withdrawals", {
        method: "PUT",
        body: JSON.stringify({ withdrawalId, status }),
      });
      fetchWithdrawals();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Withdrawals</h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage reseller withdrawal requests</p>
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : withdrawals.length > 0 ? (
        <div className="card-flat overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reseller</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{w.storeName}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{w.userName}</p>
                      </div>
                    </td>
                    <td className="font-bold text-lg">GHS {parseFloat(w.amount).toFixed(2)}</td>
                    <td>{w.bankName}</td>
                    <td>
                      <div>
                        <p className="text-sm">{w.accountName}</p>
                        <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{w.accountNumber}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        w.status === "completed" ? "badge-success" :
                        w.status === "rejected" ? "badge-danger" :
                        w.status === "processing" ? "badge-info" : "badge-warning"
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {w.status === "pending" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleAction(w.id, "completed")}
                            className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20"
                            title="Approve"
                          >
                            <CheckCircle size={16} style={{ color: "var(--success)" }} />
                          </button>
                          <button
                            onClick={() => handleAction(w.id, "rejected")}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20"
                            title="Reject"
                          >
                            <XCircle size={16} style={{ color: "var(--danger)" }} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <CreditCard size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
          <p style={{ color: "var(--text-secondary)" }}>No withdrawal requests</p>
        </div>
      )}
    </div>
  );
}
