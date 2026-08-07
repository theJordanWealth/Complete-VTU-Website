"use client";
import { useEffect, useState } from "react";
import { Users, Shield, Search, MoreVertical, LogIn, UserCheck, UserX } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  role: string;
  isAgent: boolean;
  isActive: boolean;
  balance: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionUser, setActionUser] = useState<User | null>(null);
  const router = useRouter();

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleLoginAs = async (userId: string) => {
    try {
      const data = await apiFetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ action: "login_as", userId }),
      });
      if (data.success) {
        router.push("/dashboard");
      }
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const toggleAgent = async (userId: string, currentIsAgent: boolean) => {
    try {
      await apiFetch("/api/admin/users", {
        method: "PUT",
        body: JSON.stringify({ userId, isAgent: !currentIsAgent }),
      });
      fetchUsers();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const toggleActive = async (userId: string, currentIsActive: boolean) => {
    try {
      await apiFetch("/api/admin/users", {
        method: "PUT",
        body: JSON.stringify({ userId, isActive: !currentIsActive }),
      });
      fetchUsers();
    } catch (err) {
      alert("Failed: " + (err as Error).message);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Users
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage all users on the platform
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full sm:w-64"
            placeholder="Search users..."
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <span className="spinner" style={{ color: "var(--accent)" }} />
        </div>
      ) : (
        <div className="card-flat overflow-hidden">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Agent</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div>
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.email}</p>
                        {u.phone && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{u.phone}</p>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        u.role === "admin" ? "badge-purple" : u.role === "reseller" ? "badge-info" : "badge-warning"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleAgent(u.id, u.isAgent)}
                        className={`badge cursor-pointer ${u.isAgent ? "badge-success" : "badge-warning"}`}
                      >
                        {u.isAgent ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="font-semibold">GHS {parseFloat(u.balance).toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => toggleActive(u.id, u.isActive)}
                        className={`badge cursor-pointer ${u.isActive ? "badge-success" : "badge-danger"}`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleLoginAs(u.id)}
                          className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"
                          title="Login as this user"
                        >
                          <LogIn size={16} style={{ color: "var(--accent)" }} />
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
    </div>
  );
}
