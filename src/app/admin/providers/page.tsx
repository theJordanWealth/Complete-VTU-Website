"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Server, Plus, Edit, Trash, Save, X, Wifi, WifiOff } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  apiEngine: string;
  endpoints: Record<string, string>;
  isActive: boolean;
  balance: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Provider>>({});
  const [newProvider, setNewProvider] = useState({
    name: "",
    baseUrl: "",
    apiKey: "",
    apiEngine: "",
    endpoints: '{"order":"/api/order","balance":"/api/balance","packages":"/api/packages"}',
  });

  const fetchProviders = () => {
    fetch("/api/admin/providers")
      .then((r) => r.json())
      .then((data) => {
        setProviders(data.providers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProviders(); }, []);

  const handleAdd = async () => {
    try {
      await apiFetch("/api/admin/providers", {
        method: "POST",
        body: JSON.stringify({
          ...newProvider,
          endpoints: JSON.parse(newProvider.endpoints),
        }),
      });
      setShowAdd(false);
      setNewProvider({ name: "", baseUrl: "", apiKey: "", apiEngine: "", endpoints: '{"order":"/api/order","balance":"/api/balance","packages":"/api/packages"}' });
      fetchProviders();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const updates = { ...editForm };
      if (typeof updates.endpoints === "string") {
        updates.endpoints = JSON.parse(updates.endpoints as string);
      }
      await apiFetch("/api/admin/providers", {
        method: "PUT",
        body: JSON.stringify({ id, ...updates }),
      });
      setEditing(null);
      fetchProviders();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this provider?")) return;
    try {
      await apiFetch("/api/admin/providers", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      fetchProviders();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const toggleActive = async (provider: Provider) => {
    await apiFetch("/api/admin/providers", {
      method: "PUT",
      body: JSON.stringify({ id: provider.id, isActive: !provider.isActive }),
    });
    fetchProviders();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Providers</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Manage API providers for data delivery</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-3d btn-primary text-sm px-4 py-2 flex items-center gap-2">
          <Plus size={16} /> Add Provider
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20"><span className="spinner" style={{ color: "var(--accent)" }} /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providers.map((p) => (
            <div key={p.id} className="card p-6">
              {editing === p.id ? (
                <div className="space-y-3">
                  <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="input-field" placeholder="Provider name" />
                  <input type="text" value={editForm.baseUrl || ""} onChange={(e) => setEditForm({...editForm, baseUrl: e.target.value})} className="input-field" placeholder="Base URL" />
                  <input type="text" value={editForm.apiKey || ""} onChange={(e) => setEditForm({...editForm, apiKey: e.target.value})} className="input-field" placeholder="API Key" />
                  <input type="text" value={editForm.apiEngine || ""} onChange={(e) => setEditForm({...editForm, apiEngine: e.target.value})} className="input-field" placeholder="API Engine (v1, v2...)" />
                  <textarea value={typeof editForm.endpoints === "string" ? editForm.endpoints : JSON.stringify(editForm.endpoints || {}, null, 2)} onChange={(e) => setEditForm({...editForm, endpoints: e.target.value as any})} className="input-field" rows={3} placeholder="Endpoints JSON" />
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdate(p.id)} className="btn-3d btn-primary flex-1 py-2 text-sm"><Save size={14} className="inline mr-1" /> Save</button>
                    <button onClick={() => setEditing(null)} className="btn-3d btn-outline flex-1 py-2 text-sm"><X size={14} className="inline mr-1" /> Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: p.isActive ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: p.isActive ? "var(--success)" : "var(--danger)" }}>
                        {p.isActive ? <Wifi size={24} /> : <WifiOff size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{p.apiEngine || "No engine"}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleActive(p)} className={`badge cursor-pointer ${p.isActive ? "badge-success" : "badge-danger"}`}>
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-muted)" }}>Base URL</span>
                      <span className="font-mono text-xs truncate max-w-48" style={{ color: "var(--text-secondary)" }}>{p.baseUrl}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: "var(--text-muted)" }}>API Key</span>
                      <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{p.apiKey.substring(0, 12)}...</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(p.id); setEditForm(p); }} className="btn-3d btn-outline flex-1 py-2 text-sm"><Edit size={14} className="inline mr-1" /> Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-xl border-2 border-red-500/20 hover:bg-red-500/10"><Trash size={14} style={{ color: "var(--danger)" }} /></button>
                  </div>
                </>
              )}
            </div>
          ))}

          {providers.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <Server size={48} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p style={{ color: "var(--text-secondary)" }}>No providers configured yet</p>
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Add Provider</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={newProvider.name} onChange={(e) => setNewProvider({...newProvider, name: e.target.value})} className="input-field" placeholder="Provider name" />
              <input type="text" value={newProvider.baseUrl} onChange={(e) => setNewProvider({...newProvider, baseUrl: e.target.value})} className="input-field" placeholder="Base URL (https://api.provider.com)" />
              <input type="text" value={newProvider.apiKey} onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})} className="input-field" placeholder="API Key" />
              <input type="text" value={newProvider.apiEngine} onChange={(e) => setNewProvider({...newProvider, apiEngine: e.target.value})} className="input-field" placeholder="API Engine (v1, v2...)" />
              <textarea value={newProvider.endpoints} onChange={(e) => setNewProvider({...newProvider, endpoints: e.target.value})} className="input-field" rows={4} placeholder="Endpoints JSON" />
              <button onClick={handleAdd} className="btn-3d btn-primary w-full py-3"><Plus size={16} className="inline mr-2" /> Add Provider</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
