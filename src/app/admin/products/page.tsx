"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { Package, Plus, Upload, Edit, Trash, Save, X } from "lucide-react";

interface Product {
  id: string;
  name: string;
  providerId: string;
  providerPackageId: string;
  network: string;
  dataAmount: string;
  validity: string;
  price: string;
  agentPrice: string;
  costPrice: string;
  category: string;
  isActive: boolean;
  description: string;
}

interface Provider {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importProvider, setImportProvider] = useState("");
  const [importJson, setImportJson] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    network: "",
    dataAmount: "",
    validity: "",
    price: "",
    agentPrice: "",
    costPrice: "",
    providerId: "",
    category: "data",
    description: "",
  });

  const fetchAll = async () => {
    try {
      const [prodData, provData] = await Promise.all([
        apiFetch("/api/admin/products"),
        apiFetch("/api/admin/providers"),
      ]);
      setProducts(prodData.products || []);
      setProviders(provData.providers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    try {
      await apiFetch("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(newProduct),
      });
      setShowAdd(false);
      setNewProduct({ name: "", network: "", dataAmount: "", validity: "", price: "", agentPrice: "", costPrice: "", providerId: "", category: "data", description: "" });
      fetchAll();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Product>) => {
    try {
      await apiFetch("/api/admin/products", {
        method: "PUT",
        body: JSON.stringify({ id, ...updates }),
      });
      setEditing(null);
      fetchAll();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await apiFetch("/api/admin/products", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      fetchAll();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const handleImport = async () => {
    try {
      const packages = JSON.parse(importJson);
      const data = await apiFetch("/api/admin/products/import", {
        method: "POST",
        body: JSON.stringify({ providerId: importProvider, packages }),
      });
      alert(`Imported ${data.imported} packages`);
      setShowImport(false);
      setImportJson("");
      fetchAll();
    } catch (err) {
      alert("Import failed: " + (err as Error).message);
    }
  };

  const toggleActive = async (product: Product) => {
    await handleUpdate(product.id, { isActive: !product.isActive });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Products
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage data packages and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowImport(true)} className="btn-3d btn-outline text-sm px-4 py-2 flex items-center gap-2">
            <Upload size={16} /> Import
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-3d btn-primary text-sm px-4 py-2 flex items-center gap-2">
            <Plus size={16} /> Add Product
          </button>
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
                  <th>Product</th>
                  <th>Network</th>
                  <th>Data</th>
                  <th>Validity</th>
                  <th>Price</th>
                  <th>Agent Price</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.name}</td>
                    <td>{p.network}</td>
                    <td>{p.dataAmount}</td>
                    <td>{p.validity}</td>
                    <td className="font-semibold">GHS {parseFloat(p.price).toFixed(2)}</td>
                    <td>GHS {parseFloat(p.agentPrice || "0").toFixed(2)}</td>
                    <td>GHS {parseFloat(p.costPrice || "0").toFixed(2)}</td>
                    <td>
                      <button onClick={() => toggleActive(p)} className={`badge cursor-pointer ${p.isActive ? "badge-success" : "badge-danger"}`}>
                        {p.isActive ? "Active" : "Hidden"}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10">
                          <Trash size={14} style={{ color: "var(--danger)" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Add Product</h2>
              <button onClick={() => setShowAdd(false)}><X size={20} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="input-field" placeholder="Product name" />
              <div className="grid grid-cols-2 gap-3">
                <select value={newProduct.network} onChange={(e) => setNewProduct({...newProduct, network: e.target.value})} className="select-field">
                  <option value="">Network</option>
                  <option value="MTN">MTN</option>
                  <option value="Vodafone">Vodafone</option>
                  <option value="AirtelTigo">AirtelTigo</option>
                </select>
                <input type="text" value={newProduct.dataAmount} onChange={(e) => setNewProduct({...newProduct, dataAmount: e.target.value})} className="input-field" placeholder="Data (1GB)" />
              </div>
              <input type="text" value={newProduct.validity} onChange={(e) => setNewProduct({...newProduct, validity: e.target.value})} className="input-field" placeholder="Validity (7 Days)" />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} className="input-field" placeholder="Price (GHS)" />
                <input type="number" value={newProduct.agentPrice} onChange={(e) => setNewProduct({...newProduct, agentPrice: e.target.value})} className="input-field" placeholder="Agent Price" />
                <input type="number" value={newProduct.costPrice} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})} className="input-field" placeholder="Cost Price" />
              </div>
              <select value={newProduct.providerId} onChange={(e) => setNewProduct({...newProduct, providerId: e.target.value})} className="select-field">
                <option value="">No Provider (Manual)</option>
                {providers.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
              <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="input-field" rows={2} placeholder="Description" />
              <button onClick={handleAdd} className="btn-3d btn-primary w-full py-3">Add Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="modal-overlay" onClick={() => setShowImport(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Import Packages</h2>
              <button onClick={() => setShowImport(false)}><X size={20} style={{ color: "var(--text-muted)" }} /></button>
            </div>
            <div className="space-y-3">
              <select value={importProvider} onChange={(e) => setImportProvider(e.target.value)} className="select-field">
                <option value="">Select Provider</option>
                {providers.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
              <textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} className="input-field" rows={8} placeholder='Paste JSON array of packages: [{"name":"...", "price": 5, "network":"MTN", "dataAmount":"1GB", "validity":"1 Day"}]' />
              <button onClick={handleImport} disabled={!importProvider || !importJson} className="btn-3d btn-primary w-full py-3">
                <Upload size={16} className="inline mr-2" /> Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
