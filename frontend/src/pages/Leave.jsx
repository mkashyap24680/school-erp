import { useEffect, useState } from "react";
import { Plus, CalendarOff } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = { from_date: "", to_date: "", reason: "" };

export default function Leave() {
  const { user } = useAuth();
  const canReview = ["admin", "management"].includes(user?.role);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/leave").then((res) => setRequests(res.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/leave", form); setModalOpen(false); setForm(emptyForm); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to submit leave request."); }
    finally { setSaving(false); }
  };

  const handleReview = async (id, status) => {
    const review_note = status === "rejected" ? window.prompt("Reason for rejection (optional):") || "" : "";
    await api.put(`/leave/${id}/review`, { status, review_note });
    load();
  };

  return (
    <DashboardLayout title="Leave Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm flex items-center gap-2"><CalendarOff size={16} /> Apply for leave and track approval status.</p>
        <button onClick={() => { setForm(emptyForm); setError(""); setModalOpen(true); }} className="btn-primary"><Plus size={16} /> Apply for Leave</button>
      </div>

      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr>{canReview && <th>Applicant</th>}<th>From</th><th>To</th><th>Reason</th><th>Status</th>{canReview && <th>Actions</th>}</tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {!loading && requests.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-navy-900/40">No leave requests yet.</td></tr>}
            {requests.map((r) => (
              <tr key={r.id}>
                {canReview && <td className="font-medium">{r.applicant_name} <span className="badge badge-gray capitalize ml-1">{r.applicant_role}</span></td>}
                <td>{r.from_date}</td>
                <td>{r.to_date}</td>
                <td className="max-w-xs truncate">{r.reason}</td>
                <td><span className={`badge ${r.status === "approved" ? "badge-green" : r.status === "rejected" ? "badge-red" : "badge-orange"} capitalize`}>{r.status}</span></td>
                {canReview && (
                  <td>
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(r.id, "approved")} className="btn-outline text-xs">Approve</button>
                        <button onClick={() => handleReview(r.id, "rejected")} className="btn-outline text-xs text-red-500">Reject</button>
                      </div>
                    ) : "—"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">From date</label><input type="date" required value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })} className="form-input" /></div>
            <div><label className="form-label">To date</label><input type="date" required value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })} className="form-input" /></div>
          </div>
          <div><label className="form-label">Reason</label><textarea required rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="form-input" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Submitting..." : "Submit Request"}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
