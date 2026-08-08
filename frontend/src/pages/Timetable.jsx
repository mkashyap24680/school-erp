import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarClock } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DAYS = ["", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const emptyForm = { class_id: "", teacher_id: "", subject: "", day_of_week: 2, period: 1, start_time: "", end_time: "", room: "" };

export default function Timetable() {
  const { user } = useAuth();
  const canManage = ["admin", "management"].includes(user?.role);
  const isSelfView = ["student", "teacher"].includes(user?.role);

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClasses = () => {
    if (isSelfView) return;
    api.get("/classes").then((res) => {
      setClasses(res.data);
      if (res.data.length) setClassId(String(res.data[0].id));
    });
  };

  const loadSlots = () => {
    setLoading(true);
    const req = isSelfView ? api.get("/timetable/me") : api.get("/timetable", { params: classId ? { class_id: classId } : {} });
    req.then((res) => setSlots(res.data)).finally(() => setLoading(false));
  };

  useEffect(loadClasses, []);
  useEffect(loadSlots, [classId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/timetable", { ...form, class_id: form.class_id || classId, teacher_id: form.teacher_id || null });
      setModalOpen(false);
      setForm(emptyForm);
      loadSlots();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save slot. Check for a clash on that day/period.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timetable slot?")) return;
    await api.delete(`/timetable/${id}`);
    loadSlots();
  };

  const byDay = {};
  for (let d = 1; d <= 7; d++) byDay[d] = slots.filter((s) => s.day_of_week === d).sort((a, b) => a.period - b.period);

  return (
    <DashboardLayout title="Timetable">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <p className="text-navy-900/50 text-sm flex items-center gap-2">
          <CalendarClock size={16} /> {isSelfView ? "Your weekly schedule." : "Weekly class schedule."}
        </p>
        <div className="flex gap-3">
          {!isSelfView && (
            <select value={classId} onChange={(e) => setClassId(e.target.value)} className="form-input w-auto">
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
          )}
          {canManage && (
            <button onClick={() => { setForm({ ...emptyForm, class_id: classId }); setError(""); setModalOpen(true); }} className="btn-primary">
              <Plus size={16} /> Add Slot
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <div key={d} className="card p-4">
              <h3 className="font-bold text-navy-900 mb-3">{DAYS[d]}</h3>
              {byDay[d].length === 0 ? (
                <p className="text-xs text-navy-900/40">No classes.</p>
              ) : (
                <div className="space-y-2">
                  {byDay[d].map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-[#f7f8fa] rounded-lg px-3 py-2">
                      <div>
                        <div className="text-sm font-semibold text-navy-900">{s.subject}</div>
                        <div className="text-xs text-navy-900/50">
                          P{s.period} {s.start_time && `• ${s.start_time}-${s.end_time}`} {s.room && `• ${s.room}`}
                        </div>
                        {(s.SchoolClass || s.Teacher) && (
                          <div className="text-xs text-navy-900/40">
                            {s.SchoolClass ? `${s.SchoolClass.name}${s.SchoolClass.section}` : ""} {s.Teacher ? `— ${s.Teacher.name}` : ""}
                          </div>
                        )}
                      </div>
                      {canManage && (
                        <button onClick={() => handleDelete(s.id)} className="p-1 rounded hover:bg-red-50 text-red-500 shrink-0">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Timetable Slot">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Subject</label>
            <input name="subject" required value={form.subject} onChange={handleChange} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Day</label>
              <select name="day_of_week" value={form.day_of_week} onChange={handleChange} className="form-input">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => <option key={d} value={d}>{DAYS[d]}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Period</label>
              <input type="number" min="1" max="10" name="period" value={form.period} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Start time</label>
              <input type="time" name="start_time" value={form.start_time} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">End time</label>
              <input type="time" name="end_time" value={form.end_time} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">Room</label>
            <input name="room" value={form.room} onChange={handleChange} className="form-input" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Slot"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
