"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  Wallet,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  reference: string;
  paymentMethod: string;
  createdAt: string;
}

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("kora");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((data) => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          paymentMethod,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Simulate payment success (in production, redirect to payment gateway)
        await fetch("/api/wallet", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: data.reference,
            status: "completed",
          }),
        });

        await refreshUser();
        setShowTopup(false);
        setAmount("");

        // Refresh transactions
        const txnRes = await fetch("/api/wallet");
        const txnData = await txnRes.json();
        setTransactions(txnData.transactions || []);
      }
    } catch (err) {
      console.error("Top up error:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        My Wallet
      </h1>

      {/* Balance Card */}
      <div
        className="rounded-2xl p-6 mb-8 text-white relative overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 -ml-10 -mb-10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={20} />
            <span className="text-sm text-white/70">Wallet Balance</span>
          </div>
          <p className="text-4xl font-black mb-4">
            GHS {user ? parseFloat(user.balance).toFixed(2) : "0.00"}
          </p>
          <button
            onClick={() => setShowTopup(true)}
            className="btn-3d bg-white/20 hover:bg-white/30 text-white px-6 py-2 inline-flex items-center gap-2"
          >
            <Plus size={16} /> Top Up Wallet
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="card-flat overflow-hidden">
        <div
          className="px-6 py-4 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <h2 className="font-bold" style={{ color: "var(--text-primary)" }}>
            Transaction History
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <span className="spinner" style={{ color: "var(--accent)" }} />
          </div>
        ) : transactions.length > 0 ? (
          <div>
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center gap-4 px-6 py-4 border-b last:border-0"
                style={{ borderColor: "var(--border)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      txn.type === "wallet_topup"
                        ? "rgba(16, 185, 129, 0.1)"
                        : "rgba(239, 68, 68, 0.1)",
                    color:
                      txn.type === "wallet_topup"
                        ? "var(--success)"
                        : "var(--danger)",
                  }}
                >
                  {txn.type === "wallet_topup" ? (
                    <ArrowDownLeft size={18} />
                  ) : (
                    <ArrowUpRight size={18} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {txn.type === "wallet_topup"
                      ? "Wallet Top Up"
                      : txn.type === "order_payment"
                      ? "Order Payment"
                      : txn.type}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {new Date(txn.createdAt).toLocaleString()} • {txn.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-semibold"
                    style={{
                      color:
                        txn.type === "wallet_topup"
                          ? "var(--success)"
                          : "var(--danger)",
                    }}
                  >
                    {txn.type === "wallet_topup" ? "+" : "-"}GHS{" "}
                    {parseFloat(txn.amount).toFixed(2)}
                  </p>
                  <span
                    className={`badge text-[10px] ${
                      txn.status === "completed"
                        ? "badge-success"
                        : txn.status === "failed"
                        ? "badge-danger"
                        : "badge-warning"
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <CreditCard
              size={40}
              className="mx-auto mb-3"
              style={{ color: "var(--text-muted)" }}
            />
            <p style={{ color: "var(--text-secondary)" }}>No transactions yet</p>
          </div>
        )}
      </div>

      {/* Top Up Modal */}
      {showTopup && (
        <div className="modal-overlay" onClick={() => setShowTopup(false)}>
          <div
            className="modal-content p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Top Up Wallet
            </h2>

            <div className="mb-4">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Amount (GHS)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field"
                placeholder="Enter amount"
                min="1"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("kora")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    paymentMethod === "kora"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  <CreditCard
                    size={24}
                    className="mx-auto mb-2"
                    style={{ color: "var(--accent)" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Kora Pay
                  </span>
                  <span className="block text-xs" style={{ color: "var(--text-muted)" }}>
                    Primary
                  </span>
                </button>
                <button
                  onClick={() => setPaymentMethod("paystack")}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    paymentMethod === "paystack"
                      ? "border-[var(--accent)] bg-[var(--accent)]/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  <CreditCard
                    size={24}
                    className="mx-auto mb-2"
                    style={{ color: "var(--accent)" }}
                  />
                  <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Paystack
                  </span>
                  <span className="block text-xs" style={{ color: "var(--text-muted)" }}>
                    Optional
                  </span>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTopup(false)}
                className="btn-3d btn-outline flex-1 py-3"
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={!amount || processing}
                className="btn-3d btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <Plus size={16} /> Top Up
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
