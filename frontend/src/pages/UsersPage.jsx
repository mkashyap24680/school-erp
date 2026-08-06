import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", email: "", password: "", role: "student", phone: "" };
const ROLES = ["admin", "management", "teacher", "student", "parent"];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/users").then((res) => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (u) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, phone: u.phone || "" });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post("/users", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user account? This cannot be undone.")) return;
    await api.delete(`/users/${id}`);
    load();
  };

  const toggleActive = async (u) => {
    await api.put(`/users/${u.id}`, { is_active: !u.is_active });
    load();
  };

  return (
    <DashboardLayout title="User Access">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm flex items-center gap-2">
          <ShieldCheck size={16} /> Manage login accounts &amp; role-based access for Admin, Management, Teachers and Students.
        </p>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add User</button>
      </div>

      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium">{u.name}</td>
                <td>{u.email}</td>
                <td><span className="badge badge-gray capitalize">{u.role}</span></td>
                <td>{u.phone || "—"}</td>
                <td>
                  <button onClick={() => toggleActive(u)} className={`badge ${u.is_active ? "badge-green" : "badge-red"}`}>
                    {u.is_active ? "Active" : "Disabled"}
                  </button>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60">
                      <Pencil size={15} />
                    </button>
                    {u.id !== currentUser.id && (
                      <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit User" : "Add User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Full name</label>
            <input name="name" required value={form.name} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" name="email" required value={form.email} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="form-input">
              {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">{editingId ? "New password (leave blank to keep current)" : "Password"}</label>
            <input type="password" name="password" required={!editingId} minLength={6} value={form.password} onChange={handleChange} className="form-input" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save User"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
