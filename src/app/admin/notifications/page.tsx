"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Bell, Plus, Trash, X, Edit, Save } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  target: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", target: "everyone" });

  const fetchNotifications = () => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleAdd = async () => {
    try {
      await apiFetch("/api/admin/notifications", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowAdd(false);
      setForm({ title: "", message: "", target: "everyone" });
      fetchNotifications();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const handleToggle = async (n: Notification) => {
    try {
      await apiFetch("/api/admin/notifications", {
        method: "PUT",
        body: JSON.stringify({ id: n.id, isActive: !n.isActive }),
      });
      fetchNotifications();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await apiFetch("/api/admin/notifications", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Notifications</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Send notifications to users, resellers, or agents</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-3d btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Plus size={16} /> New Notification
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div key={n.id} className="card-flat p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: n.isActive ? "rgba(124, 58, 237, 0.1)" : "rgba(148, 163, 184, 0.1)", color: n.isActive ? "var(--accent)" : "var(--text-muted)" }}>
                <Bell size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{n.title}</h3>
                  <span className={`badge ${
                    n.target === "everyone" ? "badge-info" :
                    n.target === "resellers" ? "badge-purple" :
                    n.target === "agents" ? "badge-success" : "badge-warning"
                  }`}>
                    {n.target}
                  </span>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleToggle(n)} className={`badge cursor-pointer ${n.isActive ? "badge-success" : "badge-warning"}`}>
                  {n.isActive ? "Active" : "Hidden"}
                </button>
                <button onClick={() => handleDelete(n.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                  <Trash size={14} style={{ color: "var(--danger)" }} />
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)" }}>No notifications</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>New Notification</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="input-field" placeholder="Title" />
              <textarea value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} className="input-field" rows={4} placeholder="Message..." />
              <select value={form.target} onChange={(e) => setForm({...form, target: e.target.value})} className="select-field">
                <option value="everyone">Everyone</option>
                <option value="resellers">Resellers Only</option>
                <option value="agents">Agents Only</option>
                <option value="users">Regular Users Only</option>
              </select>
              <button onClick={handleAdd} className="btn-3d btn-primary w-full py-3"><Bell size={16} className="inline mr-2" /> Send Notification</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
