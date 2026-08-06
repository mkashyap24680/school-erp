import { useEffect, useState } from "react";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const TYPE_STYLE = { holiday: "badge-red", event: "badge-green", exam: "badge-orange", meeting: "badge-gray" };
const emptyForm = { title: "", description: "", date: "", type: "event" };

export default function Events() {
  const { user } = useAuth();
  const canManage = ["admin", "management"].includes(user?.role);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => { setLoading(true); api.get("/events").then((res) => setEvents(res.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/events", form); setModalOpen(false); setForm(emptyForm); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to create event."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (window.confirm("Delete this event?")) { await api.delete(`/events/${id}`); load(); } };

  const grouped = events.reduce((acc, e) => {
    const monthKey = e.date.slice(0, 7);
    acc[monthKey] = acc[monthKey] || [];
    acc[monthKey].push(e);
    return acc;
  }, {});

  return (
    <DashboardLayout title="Events & Holiday Calendar">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm flex items-center gap-2"><CalendarDays size={16} /> School events, holidays & important dates.</p>
        {canManage && <button onClick={() => { setForm(emptyForm); setError(""); setModalOpen(true); }} className="btn-primary"><Plus size={16} /> Add Event</button>}
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : events.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No events scheduled yet.</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, items]) => (
            <div key={month}>
              <h3 className="font-bold text-navy-900 mb-2">
                {new Date(month + "-01").toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((e) => (
                  <div key={e.id} className="card p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-navy-900 text-sm">{e.title}</span>
                          <span className={`badge ${TYPE_STYLE[e.type]} capitalize`}>{e.type}</span>
                        </div>
                        <p className="text-xs text-navy-900/50">{new Date(e.date).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}</p>
                        {e.description && <p className="text-xs text-navy-900/60 mt-1">{e.description}</p>}
                      </div>
                      {canManage && <button onClick={() => handleDelete(e.id)} className="p-1 rounded hover:bg-red-50 text-red-500 shrink-0"><Trash2 size={13} /></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Event">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Date</label><input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="form-input">
              <option value="event">Event</option><option value="holiday">Holiday</option><option value="exam">Exam</option><option value="meeting">Meeting</option>
            </select>
          </div>
          <div><label className="form-label">Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Event"}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
