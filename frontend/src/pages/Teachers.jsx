import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import IdCardButton from "../components/IdCardButton";
import BulkImportButton from "../components/BulkImportButton";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { name: "", email: "", phone: "", subject: "", qualification: "", joining_date: "" };

export default function Teachers() {
  const { user } = useAuth();
  const canEdit = ["admin", "management"].includes(user?.role);
  const canDelete = user?.role === "admin";

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/teachers").then((res) => setTeachers(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || "", email: t.email || "", phone: t.phone || "",
      subject: t.subject || "", qualification: t.qualification || "", joining_date: t.joining_date || "",
    });
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
        await api.put(`/teachers/${editingId}`, form);
      } else {
        await api.post("/teachers", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save teacher.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this teacher record? This cannot be undone.")) return;
    await api.delete(`/teachers/${id}`);
    load();
  };

  const columns = [
    { key: "name", label: "Name", render: (t) => <span className="font-medium">{t.name}</span> },
    { key: "subject", label: "Subject" },
    { key: "phone", label: "Phone" },
    { key: "qualification", label: "Qualification" },
    {
      key: "classes", label: "Classes Handled",
      exportValue: (t) => t.classesHandled?.length ? t.classesHandled.map((c) => `${c.name}${c.section}`).join(", ") : "—",
      render: (t) => t.classesHandled?.length ? t.classesHandled.map((c) => `${c.name}${c.section}`).join(", ") : "—",
    },
  ];

  return (
    <DashboardLayout title="Teachers">
      <div className="card p-4 sm:p-5">
        <div className="flex justify-end mb-4 gap-2">
          {canEdit && (
            <BulkImportButton
              endpoint="/teachers/bulk"
              payloadKey="teachers"
              expectedColumns={[{ key: "name", label: "name" }, { key: "email", label: "email" }, { key: "phone", label: "phone" }, { key: "subject", label: "subject" }]}
              onDone={load}
            />
          )}
          {canEdit && (
            <button onClick={openCreate} className="btn-primary">
              <Plus size={16} /> Add Teacher
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={teachers}
            searchPlaceholder="Search teachers..."
            exportFileName="teachers"
            actionsColumn={(t) => (
              <div className="flex gap-1">
                <IdCardButton person={t} type="Teacher" />
                {canEdit && (
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60">
                    <Pencil size={15} />
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Teacher" : "Add Teacher"} wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full name</label>
              <input name="name" required value={form.name} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Subject</label>
              <input name="subject" value={form.subject} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Qualification</label>
              <input name="qualification" value={form.qualification} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Joining date</label>
              <input type="date" name="joining_date" value={form.joining_date} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Teacher"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
