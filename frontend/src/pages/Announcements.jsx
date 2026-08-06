import { useEffect, useState } from "react";
import { Plus, Trash2, Megaphone } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { title: "", message: "", target_role: "all", priority: "normal" };
const ROLES = ["all", "admin", "management", "teacher", "student", "parent"];

const PRIORITY_STYLE = {
  urgent: "badge-red",
  important: "badge-orange",
  normal: "badge-gray",
};

export default function Announcements() {
  const { user } = useAuth();
  const canManage = ["admin", "management"].includes(user?.role);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/announcements").then((res) => setItems(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/announcements", form);
      setModalOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to post announcement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <DashboardLayout title="Announcements">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm flex items-center gap-2">
          <Megaphone size={16} /> Notices &amp; updates for your school community.
        </p>
        {canManage && (
          <button onClick={() => { setForm(emptyForm); setError(""); setModalOpen(true); }} className="btn-primary">
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No announcements yet.</div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-navy-900">{a.title}</h3>
                    <span className={`badge ${PRIORITY_STYLE[a.priority]} capitalize`}>{a.priority}</span>
                    <span className="badge badge-gray capitalize">{a.target_role}</span>
                  </div>
                  <p className="text-sm text-navy-900/70 whitespace-pre-wrap">{a.message}</p>
                  <p className="text-xs text-navy-900/40 mt-2">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                {canManage && (
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 shrink-0">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Announcement">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Title</label>
            <input name="title" required value={form.title} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Message</label>
            <textarea name="message" required rows={4} value={form.message} onChange={handleChange} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Target audience</label>
              <select name="target_role" value={form.target_role} onChange={handleChange} className="form-input">
                {ROLES.map((r) => <option key={r} value={r} className="capitalize">{r === "all" ? "Everyone" : r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="form-input">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Posting..." : "Post Announcement"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
