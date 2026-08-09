import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Users2 } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  course_name: "",
  course_code: "",
  department_name: "",
  department_code: "",
  year: "",
  semester: "",
  session: "",
  section: "",
  teacher_id: "",
};

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

  setForm({
  course_name: c.course_name || "",
  course_code: c.course_code || "",
  department_name: c.department_name || "",
  department_code: c.department_code || "",
  year: c.year || "",
  semester: c.semester || "",
  session: c.session || "",
  section: c.section || "",
  teacher_id: c.teacher_id || "",
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
    const payload = {
  course_name: form.course_name,
  course_code: form.course_code || null,
  department_name: form.department_name,
  department_code: form.department_code || null,
  year: form.year || null,
  semester: form.semester || null,
  session: form.session || null,
  section: form.section || null,
  teacher_id: form.teacher_id || null,
};

    if (editingId) {
      await api.put(`/classes/${editingId}`, payload);
    } else {
      await api.post("/classes", payload);
    }

    setModalOpen(false);
    load();
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to save class."
    );
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
                  <h3 className="font-bold text-navy-900 text-lg">
                        {c.course_name}
                      </h3>
                      
                      <p className="text-sm text-navy-900/60 mt-1">
                        {c.course_code || "Course"}
                      </p>
                      
                      <p className="text-sm text-navy-900/70 mt-3">
                        {c.department_name}
                        {c.department_code && ` (${c.department_code})`}
                      </p>
                      
                      {c.section && (
                        <p className="text-sm text-navy-900/50 mt-1">
                          Section: {c.section}
                        </p>
                      )}
                      {c.year && (
                          <p className="text-sm text-navy-900/60 mt-1">
                            Year: {c.year}
                          </p>
                        )}
                        {c.semester && (
  <p className="text-sm text-navy-900/60 mt-1">
    Semester: {c.semester}
  </p>
)}
                        {c.session && (
                          <p className="text-sm text-navy-900/60 mt-1">
                            Session: {c.session}
                          </p>
                        )}
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
  <label className="form-label">Course name</label>
  <input
    name="course_name"
    required
    placeholder="e.g. B.Tech"
    value={form.course_name}
    onChange={handleChange}
    className="form-input"
  />
</div>

<div>
  <label className="form-label">Course code</label>
  <input
    name="course_code"
    placeholder="e.g. BT"
    value={form.course_code}
    onChange={handleChange}
    className="form-input"
  />
</div>

<div>
  <label className="form-label">Department name</label>
  <input
    name="department_name"
    required
    placeholder="e.g. Computer Science & Engineering"
    value={form.department_name}
    onChange={handleChange}
    className="form-input"
  />
</div>

<div>
  <label className="form-label">Department code</label>
  <input
    name="department_code"
    placeholder="e.g. CSE"
    value={form.department_code}
    onChange={handleChange}
    className="form-input"
  />
</div>

<div>
  <label className="form-label">
    Section <span className="font-normal opacity-50">(Optional)</span>
  </label>
  <input
    name="section"
    placeholder="e.g. A"
    value={form.section}
    onChange={handleChange}
    className="form-input"
  />
</div>
          <div>
  <label className="form-label">Year</label>
  <input
    name="year"
    required
    placeholder="e.g. 1st Year"
    value={form.year}
    onChange={handleChange}
    className="form-input"
  />
</div>
          <div>
  <label className="form-label">Semester</label>
  <input
    name="semester"
    placeholder="e.g. 1st Semester"
    value={form.semester}
    onChange={handleChange}
    className="form-input"
  />
</div>

<div>
  <label className="form-label">Session</label>
  <input
    name="session"
    required
    placeholder="e.g. 2026-27"
    value={form.session}
    onChange={handleChange}
    className="form-input"
  />
</div>

<div>
  <label className="form-label">Class teacher</label>
  <select
    name="teacher_id"
    value={form.teacher_id}
    onChange={handleChange}
    className="form-input"
  >
    <option value="">Not assigned</option>
    {teachers.map((t) => (
      <option key={t.id} value={t.id}>
        {t.name}
      </option>
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
