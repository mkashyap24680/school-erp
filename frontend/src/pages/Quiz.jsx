import { useEffect, useState } from "react";
import { Plus, Trash2, Timer, BarChart2, ClipboardCheck } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Quiz() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentQuiz />;
  return <StaffQuiz />;
}

function StudentQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null); // full quiz with questions
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = () => { setLoading(true); api.get("/quizzes/me").then((res) => setQuizzes(res.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const startQuiz = async (q) => {
    const res = await api.get(`/quizzes/${q.id}`);
    setActive(res.data);
    setAnswers({});
    setResult(null);
  };

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${active.id}/attempt`, { answers });
      setResult(res.data);
      load();
    } finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout title="Quizzes">
      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No quizzes available yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => {
            const attempt = q.QuizAttempts?.[0];
            return (
              <div key={q.id} className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-navy-900">{q.title}</h3>
                  {attempt && <span className="badge badge-green">Completed</span>}
                </div>
                <p className="text-xs text-navy-900/50 mb-3">{q.subject} • <Timer size={12} className="inline -mt-0.5" /> {q.duration_minutes} min</p>
                {attempt ? (
                  <p className="text-sm font-semibold text-brand-600">Score: {attempt.score} / {attempt.total_marks}</p>
                ) : (
                  <button onClick={() => startQuiz(q)} className="btn-primary w-full justify-center text-sm">Start Quiz</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!active && !result} onClose={() => setActive(null)} title={active?.title || ""} wide>
        {active && (
          <div className="space-y-5">
            {active.Questions?.map((q, idx) => (
              <div key={q.id}>
                <p className="font-semibold text-navy-900 mb-2">{idx + 1}. {q.question_text}</p>
                <div className="space-y-1.5">
                  {["a", "b", "c", "d"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-sm bg-[#f7f8fa] rounded-lg px-3 py-2 cursor-pointer">
                      <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === opt} onChange={() => setAnswers({ ...answers, [q.id]: opt })} />
                      {q[`option_${opt}`]}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={submitQuiz} disabled={submitting} className="btn-primary w-full justify-center">{submitting ? "Submitting..." : "Submit Quiz"}</button>
          </div>
        )}
      </Modal>

      <Modal open={!!result} onClose={() => { setResult(null); setActive(null); }} title="Quiz Result">
        {result && (
          <div className="text-center py-4">
            <div className="text-4xl font-extrabold text-brand-600 mb-2">{result.score} / {result.total_marks}</div>
            <p className="text-navy-900/60 text-sm">Your quiz has been submitted and auto-graded.</p>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

const emptyForm = { class_id: "", subject: "", title: "", duration_minutes: 10 };
const emptyQuestion = { question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a", marks: 1 };

function StaffQuiz() {
  const [quizzes, setQuizzes] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [questions, setQuestions] = useState([{ ...emptyQuestion }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [resultsModal, setResultsModal] = useState(null);
  const [results, setResults] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/quizzes"), api.get("/classes")])
      .then(([qRes, cRes]) => { setQuizzes(qRes.data); setClasses(cRes.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const addQuestion = () => setQuestions([...questions, { ...emptyQuestion }]);
  const updateQuestion = (i, field, value) => {
    const copy = [...questions];
    copy[i] = { ...copy[i], [field]: value };
    setQuestions(copy);
  };
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      await api.post("/quizzes", { ...form, questions });
      setModalOpen(false); setForm(emptyForm); setQuestions([{ ...emptyQuestion }]);
      load();
    } catch (err) { setError(err.response?.data?.message || "Failed to create quiz."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (window.confirm("Delete this quiz?")) { await api.delete(`/quizzes/${id}`); load(); } };

  const openResults = async (q) => {
    setResultsModal(q);
    const res = await api.get(`/quizzes/${q.id}/results`);
    setResults(res.data);
  };

  return (
    <DashboardLayout title="Quizzes / MCQ Exams">
      <div className="flex justify-end mb-4">
        <button onClick={() => { setForm(emptyForm); setQuestions([{ ...emptyQuestion }]); setError(""); setModalOpen(true); }} className="btn-primary"><Plus size={16} /> Create Quiz</button>
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : quizzes.length === 0 ? (
        <div className="card p-8 text-center text-navy-900/40 text-sm">No quizzes created yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => (
            <div key={q.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center"><ClipboardCheck size={16} /></div>
                  <div><h3 className="font-bold text-navy-900">{q.title}</h3><p className="text-xs text-navy-900/50">{q.subject}</p></div>
                </div>
                <button onClick={() => handleDelete(q.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={15} /></button>
              </div>
              <p className="text-xs text-navy-900/50 mb-3">Class: {q.SchoolClass ? `${q.SchoolClass.name}${q.SchoolClass.section}` : "—"} • {q.duration_minutes} min</p>
              <button onClick={() => openResults(q)} className="btn-outline text-xs w-full justify-center"><BarChart2 size={13} /> View Results</button>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create Quiz" wide>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Class</label>
              <select required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="form-input">
                <option value="">Select class</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name} {c.section}</option>)}
              </select>
            </div>
            <div><label className="form-label">Subject</label><input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="form-input" /></div>
          </div>
          <div><label className="form-label">Quiz title</label><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input" /></div>
          <div><label className="form-label">Duration (minutes)</label><input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} className="form-input w-32" /></div>

          <div className="border-t border-[#eef0f4] pt-4">
            <h4 className="font-semibold text-navy-900 mb-2">Questions</h4>
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="bg-[#f7f8fa] rounded-xl p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-navy-900/50">Question {i + 1}</span>
                    {questions.length > 1 && <button type="button" onClick={() => removeQuestion(i)} className="text-red-500 text-xs">Remove</button>}
                  </div>
                  <input placeholder="Question text" required value={q.question_text} onChange={(e) => updateQuestion(i, "question_text", e.target.value)} className="form-input" />
                  <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Option A" required value={q.option_a} onChange={(e) => updateQuestion(i, "option_a", e.target.value)} className="form-input" />
                    <input placeholder="Option B" required value={q.option_b} onChange={(e) => updateQuestion(i, "option_b", e.target.value)} className="form-input" />
                    <input placeholder="Option C" required value={q.option_c} onChange={(e) => updateQuestion(i, "option_c", e.target.value)} className="form-input" />
                    <input placeholder="Option D" required value={q.option_d} onChange={(e) => updateQuestion(i, "option_d", e.target.value)} className="form-input" />
                  </div>
                  <div className="flex gap-3 items-center">
                    <label className="text-xs text-navy-900/60">Correct:</label>
                    <select value={q.correct_option} onChange={(e) => updateQuestion(i, "correct_option", e.target.value)} className="form-input w-24">
                      <option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                    </select>
                    <label className="text-xs text-navy-900/60">Marks:</label>
                    <input type="number" value={q.marks} onChange={(e) => updateQuestion(i, "marks", Number(e.target.value))} className="form-input w-20" />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={addQuestion} className="btn-outline text-xs mt-3"><Plus size={13} /> Add Question</button>
          </div>

          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Create Quiz"}</button></div>
        </form>
      </Modal>

      <Modal open={!!resultsModal} onClose={() => setResultsModal(null)} title={`Results — ${resultsModal?.title || ""}`}>
        <table className="data-table">
          <thead><tr><th>Student</th><th>Score</th></tr></thead>
          <tbody>
            {results.length === 0 && <tr><td colSpan={2} className="text-center py-6 text-navy-900/40">No attempts yet.</td></tr>}
            {results.map((r) => (
              <tr key={r.id}><td className="font-medium">{r.Student?.name}</td><td>{r.score} / {r.total_marks}</td></tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </DashboardLayout>
  );
}
