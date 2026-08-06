import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Fees() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentFees />;
  return <StaffFees />;
}

function StudentFees() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null); // fee being paid
  const [paying, setPaying] = useState(false);
  const [payStep, setPayStep] = useState("confirm"); // confirm | success

  const load = () => { api.get("/fees/me").then((res) => setFees(res.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const totalDue = fees.reduce((sum, f) => sum + Number(f.amount) - Number(f.paid_amount), 0);

  const startPayment = (fee) => { setPayModal(fee); setPayStep("confirm"); };

  const handlePay = async () => {
    setPaying(true);
    try {
      const orderRes = await api.post("/payments/order", { fee_id: payModal.id });
      // In production this is where Razorpay/Stripe's checkout widget would
      // open using orderRes.data.orderId. Here we simulate an instant success.
      await api.post("/payments/confirm", { paymentId: orderRes.data.paymentId });
      setPayStep("success");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <DashboardLayout title="My Fees">
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
          <Wallet size={26} />
        </div>
        <div>
          <div className="text-2xl font-bold text-navy-900">₹{totalDue.toLocaleString()}</div>
          <div className="text-sm text-navy-900/50">Total outstanding balance</div>
        </div>
      </div>

      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Amount</th><th>Paid</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {!loading && fees.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-navy-900/40">No fee records yet.</td></tr>
            )}
            {fees.map((f) => (
              <tr key={f.id}>
                <td className="font-medium">{f.title}</td>
                <td>₹{Number(f.amount).toLocaleString()}</td>
                <td>₹{Number(f.paid_amount).toLocaleString()}</td>
                <td>{f.due_date || "—"}</td>
                <td><StatusBadge status={f.status} /></td>
                <td>
                  {f.status !== "paid" ? (
                    <button onClick={() => startPayment(f)} className="btn-primary text-xs">Pay Now</button>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Pay Fee">
        {payModal && payStep === "confirm" && (
          <div className="text-center py-2">
            <p className="text-sm text-navy-900/60 mb-1">{payModal.title}</p>
            <div className="text-3xl font-extrabold text-navy-900 mb-4">
              ₹{(Number(payModal.amount) - Number(payModal.paid_amount)).toLocaleString()}
            </div>
            <p className="text-xs text-navy-900/40 mb-6">
              Demo checkout — no real card details needed. In production this would open your school's
              configured payment gateway (Razorpay/Stripe).
            </p>
            <button onClick={handlePay} disabled={paying} className="btn-primary w-full justify-center py-2.5">
              {paying ? "Processing..." : "Pay Now"}
            </button>
          </div>
        )}
        {payStep === "success" && (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-navy-900">Payment successful!</p>
            <button onClick={() => setPayModal(null)} className="btn-outline mt-4">Close</button>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

const emptyForm = { student_id: "", title: "", amount: "", paid_amount: 0, due_date: "" };

function StaffFees() {
  const { user } = useAuth();
  const canDelete = user?.role === "admin";

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/fees"), api.get("/students")])
      .then(([fRes, sRes]) => { setFees(fRes.data); setStudents(sRes.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); setModalOpen(true); };
  const openEdit = (f) => {
    setEditingId(f.id);
    setForm({
      student_id: f.student_id, title: f.title, amount: f.amount,
      paid_amount: f.paid_amount, due_date: f.due_date || "",
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
        await api.put(`/fees/${editingId}`, form);
      } else {
        await api.post("/fees", form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save fee record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fee record?")) return;
    await api.delete(`/fees/${id}`);
    load();
  };

  const columns = [
    { key: "student", label: "Student", exportValue: (f) => f.Student?.name || "—", render: (f) => <span className="font-medium">{f.Student?.name || "—"}</span> },
    { key: "title", label: "Title" },
    { key: "amount", label: "Amount", exportValue: (f) => Number(f.amount), render: (f) => `₹${Number(f.amount).toLocaleString()}`, sortValue: (f) => Number(f.amount) },
    { key: "paid_amount", label: "Paid", exportValue: (f) => Number(f.paid_amount), render: (f) => `₹${Number(f.paid_amount).toLocaleString()}`, sortValue: (f) => Number(f.paid_amount) },
    { key: "due_date", label: "Due Date" },
    { key: "status", label: "Status", render: (f) => <StatusBadge status={f.status} /> },
  ];

  return (
    <DashboardLayout title="Fee Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm">Track fee collection, dues &amp; payments.</p>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Add Fee Record</button>
      </div>

      <div className="card p-4 sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={fees}
            searchPlaceholder="Search fee records..."
            exportFileName="fees"
            actionsColumn={(f) => (
              <div className="flex gap-2">
                <button onClick={() => openEdit(f)} className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60">
                  <Pencil size={15} />
                </button>
                {canDelete && (
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            )}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Fee Record" : "Add Fee Record"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
          <div>
            <label className="form-label">Student</label>
            <select name="student_id" required value={form.student_id} onChange={handleChange} className="form-input">
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Fee title</label>
            <input name="title" required placeholder="e.g. Term 1 Fee" value={form.title} onChange={handleChange} className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Amount (₹)</label>
              <input type="number" name="amount" required min="0" value={form.amount} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Paid amount (₹)</label>
              <input type="number" name="paid_amount" min="0" value={form.paid_amount} onChange={handleChange} className="form-input" />
            </div>
          </div>
          <div>
            <label className="form-label">Due date</label>
            <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="form-input" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save"}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

function StatusBadge({ status }) {
  const cls = status === "paid" ? "badge-green" : status === "partial" ? "badge-orange" : "badge-red";
  return <span className={`badge ${cls} capitalize`}>{status}</span>;
}
