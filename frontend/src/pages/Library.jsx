import { useEffect, useState } from "react";
import { Plus, Trash2, BookOpen, Undo2, BookCopy } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyBookForm = { title: "", author: "", isbn: "", category: "", total_copies: 1 };
const emptyIssueForm = { book_id: "", student_id: "", due_date: "" };

export default function Library() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentLibrary />;
  return <StaffLibrary />;
}

function StudentLibrary() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/library/issues/me").then((res) => setIssues(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Library">
      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Book</th><th>Author</th><th>Issue Date</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {!loading && issues.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-navy-900/40">You have no issued books.</td></tr>
            )}
            {issues.map((i) => (
              <tr key={i.id}>
                <td className="font-medium">{i.Book?.title}</td>
                <td>{i.Book?.author || "—"}</td>
                <td>{i.issue_date}</td>
                <td>{i.due_date}</td>
                <td><span className={`badge ${i.status === "returned" ? "badge-green" : "badge-orange"} capitalize`}>{i.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

function StaffLibrary() {
  const { user } = useAuth();
  const canDelete = user?.role === "admin";
  const [tab, setTab] = useState("books"); // books | issues

  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [bookModal, setBookModal] = useState(false);
  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [issueModal, setIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState(emptyIssueForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/library/books"), api.get("/library/issues"), api.get("/students")])
      .then(([bRes, iRes, sRes]) => { setBooks(bRes.data); setIssues(iRes.data); setStudents(sRes.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/library/books", bookForm);
      setBookModal(false);
      setBookForm(emptyBookForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add book.");
    } finally {
      setSaving(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/library/issues", issueForm);
      setIssueModal(false);
      setIssueForm(emptyIssueForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue book.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    await api.delete(`/library/books/${id}`);
    load();
  };

  const handleReturn = async (issueId) => {
    await api.put(`/library/issues/${issueId}/return`);
    load();
  };

  const bookColumns = [
    { key: "title", label: "Title", render: (b) => <span className="font-medium">{b.title}</span> },
    { key: "author", label: "Author" },
    { key: "category", label: "Category" },
    { key: "total_copies", label: "Total Copies" },
    { key: "available_copies", label: "Available" },
  ];

  const issueColumns = [
    { key: "book", label: "Book", exportValue: (i) => i.Book?.title, render: (i) => <span className="font-medium">{i.Book?.title}</span> },
    { key: "student", label: "Student", exportValue: (i) => i.Student?.name, render: (i) => i.Student?.name },
    { key: "issue_date", label: "Issue Date" },
    { key: "due_date", label: "Due Date" },
    { key: "status", label: "Status", render: (i) => <span className={`badge ${i.status === "returned" ? "badge-green" : "badge-orange"} capitalize`}>{i.status}</span> },
  ];

  return (
    <DashboardLayout title="Library Management">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setTab("books")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "books" ? "bg-navy-900 text-white" : "bg-white text-navy-900/60 border border-[#e2e5ea]"}`}>
          <BookOpen size={14} className="inline mr-1.5 -mt-0.5" /> Books
        </button>
        <button onClick={() => setTab("issues")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab === "issues" ? "bg-navy-900 text-white" : "bg-white text-navy-900/60 border border-[#e2e5ea]"}`}>
          <BookCopy size={14} className="inline mr-1.5 -mt-0.5" /> Issued Books
        </button>
        <div className="flex-1" />
        {tab === "books" ? (
          <button onClick={() => { setBookForm(emptyBookForm); setError(""); setBookModal(true); }} className="btn-primary"><Plus size={16} /> Add Book</button>
        ) : (
          <button onClick={() => { setIssueForm(emptyIssueForm); setError(""); setIssueModal(true); }} className="btn-primary"><Plus size={16} /> Issue Book</button>
        )}
      </div>

      <div className="card p-4 sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : tab === "books" ? (
          <DataTable
            columns={bookColumns}
            rows={books}
            searchPlaceholder="Search books..."
            exportFileName="library-books"
            actionsColumn={(b) => canDelete && (
              <button onClick={() => handleDeleteBook(b.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 size={15} />
              </button>
            )}
          />
        ) : (
          <DataTable
            columns={issueColumns}
            rows={issues}
            searchPlaceholder="Search issued books..."
            exportFileName="library-issues"
            actionsColumn={(i) => i.status !== "returned" && (
              <button onClick={() => handleReturn(i.id)} className="btn-outline text-xs">
                <Undo2 size={13} /> Mark Returned
              </button>
            )}
          />
        )}
      </div>

      <Modal open={bookModal} onClose={() => setBookModal(false)} title="Add Book">
        <form onSubmit={handleBookSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Title</label>
            <input required value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} className="form-input" />
          </div>
          <div>
            <label className="form-label">Author</label>
            <input value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category</label>
              <input value={bookForm.category} onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })} className="form-input" />
            </div>
            <div>
              <label className="form-label">Total copies</label>
              <input type="number" min="1" value={bookForm.total_copies} onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })} className="form-input" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setBookModal(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Add Book"}</button>
          </div>
        </form>
      </Modal>

      <Modal open={issueModal} onClose={() => setIssueModal(false)} title="Issue Book">
        <form onSubmit={handleIssueSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Book</label>
            <select required value={issueForm.book_id} onChange={(e) => setIssueForm({ ...issueForm, book_id: e.target.value })} className="form-input">
              <option value="">Select book</option>
              {books.filter((b) => b.available_copies > 0).map((b) => (
                <option key={b.id} value={b.id}>{b.title} ({b.available_copies} available)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Student</label>
            <select required value={issueForm.student_id} onChange={(e) => setIssueForm({ ...issueForm, student_id: e.target.value })} className="form-input">
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Due date</label>
            <input type="date" required value={issueForm.due_date} onChange={(e) => setIssueForm({ ...issueForm, due_date: e.target.value })} className="form-input" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIssueModal(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Issuing..." : "Issue Book"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
