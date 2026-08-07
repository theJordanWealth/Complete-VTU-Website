"use client";
import { useEffect, useState } from "react";
import { CreditCard, Plus, X, AlertCircle } from "lucide-react";

interface Withdrawal {
  id: string;
  amount: string;
  status: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  createdAt: string;
  processedAt: string;
}

export default function ResellerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequest, setShowRequest] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchWithdrawals = () => {
    fetch("/api/reseller/withdrawals")
      .then((r) => r.json())
      .then((data) => {
        setWithdrawals(data.withdrawals || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/reseller/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setShowRequest(false);
        setForm({ amount: "", accountName: "", accountNumber: "", bankName: "" });
        fetchWithdrawals();
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      setMessage("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Withdrawals</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Request and track withdrawals</p>
        </div>
        <button onClick={() => setShowRequest(true)} className="btn-3d btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Plus size={16} /> Request Withdrawal
        </button>
      </div>

      {/* Notice */}
      <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
        <div className="flex items-start gap-3">
          <AlertCircle size={18} style={{ color: "var(--info)" }} className="shrink-0 mt-0.5" />
          <p className="text-sm" style={{ color: "var(--info)" }}>
            <strong>Notice:</strong> Earnings will be sent in the next business day after withdrawal is placed. Ensure your bank details are correct.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl mb-6" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <p className="text-sm" style={{ color: "var(--success)" }}>{message}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : withdrawals.length > 0 ? (
        <div className="card-flat overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th>Requested</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td className="font-bold text-lg">GHS {parseFloat(w.amount).toFixed(2)}</td>
                    <td>{w.bankName}</td>
                    <td>
                      <p>{w.accountName}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{w.accountNumber}</p>
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
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>{new Date(w.createdAt).toLocaleString()}</td>
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

      {/* Request Modal */}
      {showRequest && (
        <div className="modal-overlay" onClick={() => setShowRequest(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Request Withdrawal</h2>
              <button onClick={() => setShowRequest(false)}><X size={20} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="input-field" placeholder="Amount (GHS)" min="10" />
              <input type="text" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})} className="input-field" placeholder="Bank Name" />
              <input type="text" value={form.accountName} onChange={(e) => setForm({...form, accountName: e.target.value})} className="input-field" placeholder="Account Name" />
              <input type="text" value={form.accountNumber} onChange={(e) => setForm({...form, accountNumber: e.target.value})} className="input-field" placeholder="Account Number" />
              <button onClick={handleSubmit} disabled={submitting} className="btn-3d btn-primary w-full py-3 flex items-center justify-center gap-2">
                {submitting ? <span className="spinner" /> : <><CreditCard size={16} /> Submit Request</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
