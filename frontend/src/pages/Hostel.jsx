import { useEffect, useState } from "react";
import { Plus, Trash2, Building2, BedDouble } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyHostel = { name: "", type: "mixed", warden_name: "", warden_phone: "" };
const emptyRoom = { hostel_id: "", room_no: "", capacity: 2 };
const emptyAllot = { student_id: "", room_id: "" };

export default function Hostel() {
  const { user } = useAuth();
  const canDelete = user?.role === "admin";

  const [hostels, setHostels] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hostelModal, setHostelModal] = useState(false);
  const [hostelForm, setHostelForm] = useState(emptyHostel);
  const [roomModal, setRoomModal] = useState(null); // hostel id
  const [roomForm, setRoomForm] = useState(emptyRoom);
  const [allotModal, setAllotModal] = useState(null); // room object
  const [allotForm, setAllotForm] = useState(emptyAllot);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/hostel"), api.get("/students")])
      .then(([hRes, sRes]) => { setHostels(hRes.data); setStudents(sRes.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleHostelSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/hostel", hostelForm); setHostelModal(false); setHostelForm(emptyHostel); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to add hostel."); }
    finally { setSaving(false); }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/hostel/rooms", { ...roomForm, hostel_id: roomModal }); setRoomModal(null); setRoomForm(emptyRoom); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to add room."); }
    finally { setSaving(false); }
  };

  const handleAllotSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/hostel/allot", { ...allotForm, room_id: allotModal.id }); setAllotModal(null); setAllotForm(emptyAllot); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to allot room."); }
    finally { setSaving(false); }
  };

  const handleDeleteHostel = async (id) => { if (window.confirm("Delete this hostel and all its rooms?")) { await api.delete(`/hostel/${id}`); load(); } };
  const handleDeleteRoom = async (id) => { if (window.confirm("Delete this room?")) { await api.delete(`/hostel/rooms/${id}`); load(); } };

  return (
    <DashboardLayout title="Hostel Management">
      <div className="flex justify-end mb-4">
        <button onClick={() => { setHostelForm(emptyHostel); setError(""); setHostelModal(true); }} className="btn-primary"><Plus size={16} /> Add Hostel</button>
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : hostels.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No hostels created yet.</div>
      ) : (
        <div className="space-y-4">
          {hostels.map((h) => (
            <div key={h.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center"><Building2 size={18} /></div>
                  <div>
                    <h3 className="font-bold text-navy-900">{h.name} <span className="badge badge-gray capitalize ml-1">{h.type}</span></h3>
                    <p className="text-xs text-navy-900/50">Warden: {h.warden_name || "—"} {h.warden_phone && `• ${h.warden_phone}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-navy-900/50">{h.occupied}/{h.totalCapacity} occupied</span>
                  <button onClick={() => { setRoomForm(emptyRoom); setError(""); setRoomModal(h.id); }} className="btn-outline text-xs"><Plus size={13} /> Room</button>
                  {canDelete && <button onClick={() => handleDeleteHostel(h.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {h.Rooms?.map((r) => (
                  <div key={r.id} className="bg-[#f7f8fa] rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-navy-900 flex items-center gap-1"><BedDouble size={13} /> {r.room_no}</span>
                      <button onClick={() => handleDeleteRoom(r.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                    <div className="text-xs text-navy-900/50 mt-1">{r.Students?.length || 0}/{r.capacity} occupied</div>
                    <button onClick={() => { setAllotForm(emptyAllot); setError(""); setAllotModal(r); }} className="text-xs text-brand-600 font-semibold mt-1 hover:underline">Allot student</button>
                  </div>
                ))}
                {(!h.Rooms || h.Rooms.length === 0) && <span className="text-xs text-navy-900/40 col-span-full">No rooms yet.</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={hostelModal} onClose={() => setHostelModal(false)} title="Add Hostel">
        <form onSubmit={handleHostelSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Hostel name</label><input required value={hostelForm.name} onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Type</label>
            <select value={hostelForm.type} onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value })} className="form-input">
              <option value="boys">Boys</option><option value="girls">Girls</option><option value="mixed">Mixed</option>
            </select>
          </div>
          <div><label className="form-label">Warden name</label><input value={hostelForm.warden_name} onChange={(e) => setHostelForm({ ...hostelForm, warden_name: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Warden phone</label><input value={hostelForm.warden_phone} onChange={(e) => setHostelForm({ ...hostelForm, warden_phone: e.target.value })} className="form-input" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setHostelModal(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Hostel"}</button></div>
        </form>
      </Modal>

      <Modal open={!!roomModal} onClose={() => setRoomModal(null)} title="Add Room">
        <form onSubmit={handleRoomSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Room number</label><input required value={roomForm.room_no} onChange={(e) => setRoomForm({ ...roomForm, room_no: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Capacity</label><input type="number" value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} className="form-input" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setRoomModal(null)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Room"}</button></div>
        </form>
      </Modal>

      <Modal open={!!allotModal} onClose={() => setAllotModal(null)} title={`Allot Room ${allotModal?.room_no || ""}`}>
        <form onSubmit={handleAllotSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Student</label>
            <select required value={allotForm.student_id} onChange={(e) => setAllotForm({ ...allotForm, student_id: e.target.value })} className="form-input">
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setAllotModal(null)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Allot"}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
