import { useEffect, useState } from "react";
import { Plus, FileText, ClipboardList } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import MarksheetButton from "../components/MarksheetButton";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Exams() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentResults />;
  return <StaffExams />;
}

function StudentResults() {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/exams/results/me").then((res) => setResults(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="My Exam Results">
      <div className="flex justify-end mb-3">
        <MarksheetButton studentId={null} studentName={user?.name || "Student"} />
        <span className="text-xs text-navy-900/40 ml-2 self-center">Download marksheet</span>
      </div>
      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Marks</th><th>Remarks</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {!loading && results.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-navy-900/40">No results published yet.</td></tr>
            )}
            {results.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.Exam?.name}</td>
                <td>{r.Exam?.subject}</td>
                <td>{r.Exam?.exam_date || "—"}</td>
                <td>{r.marks_obtained} / {r.Exam?.total_marks}</td>
                <td>{r.remarks || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

const emptyForm = { class_id: "", name: "", subject: "", exam_date: "", total_marks: 100 };

function StaffExams() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [resultModal, setResultModal] = useState(null); // exam object
  const [students, setStudents] = useState([]);
  const [marksMap, setMarksMap] = useState({});
  const [savingResults, setSavingResults] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/exams"), api.get("/classes")])
      .then(([eRes, cRes]) => { setExams(eRes.data); setClasses(cRes.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setForm(emptyForm); setError(""); setModalOpen(true); };
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/exams", form);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create exam.");
    } finally {
      setSaving(false);
    }
  };

  const openResults = async (exam) => {
    setResultModal(exam);
    setResultMessage("");
    const [sRes, rRes] = await Promise.all([
      api.get("/students"),
      api.get(`/exams/${exam.id}/results`),
    ]);
    const classStudents = sRes.data.filter((s) => String(s.class_id) === String(exam.class_id));
    setStudents(classStudents);
    const map = {};
    classStudents.forEach((s) => (map[s.id] = ""));
    rRes.data.forEach((r) => (map[r.student_id] = r.marks_obtained));
    setMarksMap(map);
  };

  const handleSaveResults = async () => {
    setSavingResults(true);
    setResultMessage("");
    try {
      const records = students
        .filter((s) => marksMap[s.id] !== "" && marksMap[s.id] !== undefined)
        .map((s) => ({ student_id: s.id, marks_obtained: Number(marksMap[s.id]) }));
      await api.post(`/exams/${resultModal.id}/results/bulk`, { records });
      setResultMessage("Results saved successfully.");
    } catch (err) {
      setResultMessage(err.response?.data?.message || "Failed to save results.");
    } finally {
      setSavingResults(false);
    }
  };

  return (
    <DashboardLayout title="Examination">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm">Create exams, schedule &amp; track results.</p>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Create Exam</button>
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : exams.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No exams created yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((ex) => (
            <div key={ex.id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-navy-900">{ex.name}</h3>
                  <p className="text-xs text-navy-900/50">{ex.subject}</p>
                </div>
              </div>
              <div className="text-sm text-navy-900/60 space-y-1 mb-4">
                <div>Class: {ex.SchoolClass ? `${ex.SchoolClass.name} ${ex.SchoolClass.section}` : "—"}</div>
                <div>Date: {ex.exam_date || "—"}</div>
                <div>Total marks: {ex.total_marks}</div>
              </div>
              <button onClick={() => openResults(ex)} className="btn-outline w-full justify-center">
                <ClipboardList size={15} /> Enter / View Results
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Exam">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Class</label>
            <select name="class_id" required value={form.class_id} onChange={handleChange} className="form-input">
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Exam name</label>
            <input name="name" required placeholder="e.g. Mid Term Exam" value={form.name} onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label className="form-label">Subject</label>
            <input name="subject" required value={form.subject} onChange={handleChange} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Exam date</label>
              <input type="date" name="exam_date" value={form.exam_date} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Total marks</label>
              <input type="number" name="total_marks" value={form.total_marks} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Create Exam"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resultModal} onClose={() => setResultModal(null)} title={`Results — ${resultModal?.name || ""}`} wide>
        {resultMessage && (
          <div className="mb-4 text-sm bg-brand-100 text-brand-600 rounded-lg px-3 py-2">{resultMessage}</div>
        )}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Student</th><th>Marks (out of {resultModal?.total_marks})</th></tr></thead>
            <tbody>
              {students.length === 0 && (
                <tr><td colSpan={2} className="text-center py-6 text-navy-900/40">No students in this class.</td></tr>
              )}
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={resultModal?.total_marks}
                      value={marksMap[s.id] ?? ""}
                      onChange={(e) => setMarksMap({ ...marksMap, [s.id]: e.target.value })}
                      className="form-input w-28"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {students.length > 0 && (
          <div className="flex justify-end pt-4">
            <button onClick={handleSaveResults} disabled={savingResults} className="btn-primary">
              {savingResults ? "Saving..." : "Save Results"}
            </button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
