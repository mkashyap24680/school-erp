import { useEffect, useState } from "react";
import { Plus, Trash2, ClipboardList, FileCheck } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Homework() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentHomework />;
  return <StaffHomework />;
}

function StudentHomework() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerModal, setAnswerModal] = useState(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/homework/me").then((res) => setAssignments(res.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/homework/${answerModal.id}/submit`, { content });
      setAnswerModal(null); setContent(""); load();
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title="Homework">
      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No homework assigned yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => {
            const submission = a.Submissions?.[0];
            return (
              <div key={a.id} className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-navy-900">{a.title}</h3>
                  {submission ? (
                    <span className={`badge ${submission.status === "graded" ? "badge-green" : "badge-orange"} capitalize`}>{submission.status}</span>
                  ) : (
                    <span className="badge badge-red">Pending</span>
                  )}
                </div>
                <p className="text-xs text-navy-900/50 mb-2">{a.subject} • Due {a.due_date || "—"}</p>
                <p className="text-sm text-navy-900/70 mb-3">{a.description}</p>
                {submission?.status === "graded" && (
                  <p className="text-xs text-brand-600 font-semibold mb-2">Grade: {submission.grade} {submission.feedback && `— ${submission.feedback}`}</p>
                )}
                <button
                  onClick={() => { setAnswerModal(a); setContent(submission?.content || ""); }}
                  className="btn-outline text-xs w-full justify-center"
                >
                  {submission ? "Update Submission" : "Submit Homework"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!answerModal} onClose={() => setAnswerModal(null)} title={`Submit — ${answerModal?.title || ""}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Your answer / notes</label>
            <textarea required rows={6} value={content} onChange={(e) => setContent(e.target.value)} className="form-input" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAnswerModal(null)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Submitting..." : "Submit"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

const emptyForm = { class_id: "", subject: "", title: "", description: "", due_date: "" };

function StaffHomework() {
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submissionsModal, setSubmissionsModal] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [gradeDraft, setGradeDraft] = useState({});

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/homework"), api.get("/classes")])
      .then(([aRes, cRes]) => { setAssignments(aRes.data); setClasses(cRes.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/homework", form); setModalOpen(false); setForm(emptyForm); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to create assignment."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (window.confirm("Delete this assignment?")) { await api.delete(`/homework/${id}`); load(); } };

  const openSubmissions = async (a) => {
    setSubmissionsModal(a);
    const res = await api.get(`/homework/${a.id}/submissions`);
    setSubmissions(res.data);
    const drafts = {};
    res.data.forEach((s) => { drafts[s.id] = { grade: s.grade || "", feedback: s.feedback || "" }; });
    setGradeDraft(drafts);
  };

  const handleGrade = async (submissionId) => {
    const d = gradeDraft[submissionId];
    await api.put(`/homework/submissions/${submissionId}/grade`, d);
    const res = await api.get(`/homework/${submissionsModal.id}/submissions`);
    setSubmissions(res.data);
  };

  return (
    <DashboardLayout title="Homework & Assignments">
      <div className="flex justify-end mb-4">
        <button onClick={() => { setForm(emptyForm); setError(""); setModalOpen(true); }} className="btn-primary"><Plus size={16} /> New Assignment</button>
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No assignments created yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignments.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center"><ClipboardList size={16} /></div>
                  <div><h3 className="font-bold text-navy-900">{a.title}</h3><p className="text-xs text-navy-900/50">{a.subject}</p></div>
                </div>
                <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
              </div>
              <p className="text-xs text-navy-900/50 mb-2">Class: {a.SchoolClass ? `${a.SchoolClass.name}${a.SchoolClass.section}` : "—"} • Due {a.due_date || "—"}</p>
              <button onClick={() => openSubmissions(a)} className="btn-outline text-xs w-full justify-center"><FileCheck size={13} /> View Submissions</button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Assignment">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Class</label>
            <select required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="form-input">
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <div><label className="form-label">Subject</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Due date</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="form-input" /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Create"}</button></div>
        </form>
      </Modal>

      <Modal open={!!submissionsModal} onClose={() => setSubmissionsModal(null)} title={`Submissions — ${submissionsModal?.title || ""}`} wide>
        {submissions.length === 0 ? (
          <p className="text-center text-navy-900/40 text-sm py-6">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="border border-[#eef0f4] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-navy-900">{s.Student?.name}</span>
                  <span className={`badge ${s.status === "graded" ? "badge-green" : "badge-orange"} capitalize`}>{s.status}</span>
                </div>
                <p className="text-sm text-navy-900/70 mb-3 whitespace-pre-wrap">{s.content}</p>
                <div className="flex gap-2">
                  <input placeholder="Grade (e.g. A / 18/20)" value={gradeDraft[s.id]?.grade || ""} onChange={(e) => setGradeDraft({ ...gradeDraft, [s.id]: { ...gradeDraft[s.id], grade: e.target.value } })} className="form-input w-40" />
                  <input placeholder="Feedback" value={gradeDraft[s.id]?.feedback || ""} onChange={(e) => setGradeDraft({ ...gradeDraft, [s.id]: { ...gradeDraft[s.id], feedback: e.target.value } })} className="form-input flex-1" />
                  <button onClick={() => handleGrade(s.id)} className="btn-primary text-xs">Save</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
