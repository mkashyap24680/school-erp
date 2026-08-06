import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", section: "", teacher_id: "" };

export default function Classes() {
  const { user } = useAuth();
  const canEdit = ["admin", "management"].includes(user?.role);
  const canDelete = user?.role === "admin";

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/classes"), api.get("/teachers").catch(() => ({ data: [] }))])
      .then(([cRes, tRes]) => {
        setClasses(cRes.data);
        setTeachers(tRes.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name || "", section: c.section || "", teacher_id: c.teacher_id || "" });
    setError("");
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, teacher_id: form.teacher_id || null };
      if (editingId) {
        await api.put(`/classes/${editingId}`, payload);
      } else {
        await api.post("/classes", payload);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save class.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    await api.delete(`/classes/${id}`);
    load();
  };

  return (
    <DashboardLayout title="Classes">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm">All classes &amp; sections in the school.</p>
        {canEdit && (
          <button onClick={openCreate} className="btn-primary">
            <Plus size={16} /> Add Class
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : classes.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No classes created yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-navy-900 text-lg">{c.name} - {c.section}</h3>
                  <p className="text-sm text-navy-900/50 mt-1">
                    Class teacher: {c.classTeacher?.name || "Not assigned"}
                  </p>
                </div>
                {(canEdit || canDelete) && (
                  <div className="flex gap-1">
                    {canEdit && (
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60">
                        <Pencil size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4 text-sm text-navy-900/60">
                <Users2 size={16} /> {c.studentCount ?? 0} students
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Class" : "Add Class"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Class name (e.g. 10th)</label>
            <input name="name" required value={form.name} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Section (e.g. A)</label>
            <input name="section" required value={form.section} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Class teacher</label>
            <select name="teacher_id" value={form.teacher_id} onChange={handleChange} className="form-input">
              <option value="">Not assigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Class"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
