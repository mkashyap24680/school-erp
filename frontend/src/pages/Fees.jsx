import { useEffect, useMemo, useState } from "react";
import { Wallet } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import { ReceiptButton, ConsolidatedReceiptButton } from "../components/ReceiptButton";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  { value: "tuition", label: "Tuition Fee" },
  { value: "transport", label: "Transport Fee" },
  { value: "hostel", label: "Hostel Fee" },
  { value: "library", label: "Library Fee" },
  { value: "exam", label: "Exam Fee" },
  { value: "other", label: "Other" },
];
const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]));

export default function Fees() {
  const { user } = useAuth();
  if (user?.role === "student") return <StudentFees />;
  return <StaffFees />;
}

function StudentFees() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState(null); // fee being paid
  const [paying, setPaying] = useState(false);
  const [payStep, setPayStep] = useState("confirm"); // confirm | success

  const load = () => {
    api.get("/fees/me")
      .then((res) => { setFees(res.data.fees); setStudentProfile(res.data.student); })
      .finally(() => setLoading(false));
  };
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
        <div className="flex-1">
          <div className="text-2xl font-bold text-navy-900">₹{totalDue.toLocaleString()}</div>
          <div className="text-sm text-navy-900/50">Total outstanding balance</div>
        </div>
        <ConsolidatedReceiptButton fees={fees} student={studentProfile} studentName={user?.name} label="Download Full Receipt" />
      </div>

      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Paid</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {!loading && fees.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-navy-900/40">No fee records yet.</td></tr>
            )}
            {fees.map((f) => (
              <tr key={f.id}>
                <td className="font-medium">{f.title}</td>
                <td><span className="badge badge-gray">{CATEGORY_LABEL[f.category] || "Tuition Fee"}</span></td>
                <td>₹{Number(f.amount).toLocaleString()}</td>
                <td>₹{Number(f.paid_amount).toLocaleString()}</td>
                <td>{f.due_date || "—"}</td>
                <td><StatusBadge status={f.status} /></td>
                <td>
                  <div className="flex items-center gap-2">
                    {f.status !== "paid" && (
                      <button onClick={() => startPayment(f)} className="btn-primary text-xs">Pay Now</button>
                    )}
                    {Number(f.paid_amount) > 0 && (
                      <ReceiptButton fee={f} student={studentProfile} studentName={user?.name || "Student"} />
                    )}
                  </div>
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

// One editable cell for a single fee category within a student's row.
// Typing an amount + paid value and blurring the field saves it directly —
// no separate "edit" modal. Clearing the amount removes the fee record for
// that category (or zeroes it out if the user isn't allowed to delete).
function FeeCell({ studentId, category, records, canDelete, onSaved }) {
  const total = records.reduce((s, r) => s + Number(r.amount), 0);
  const paidTotal = records.reduce((s, r) => s + Number(r.paid_amount), 0);
  const [amount, setAmount] = useState(total ? String(total) : "");
  const [paid, setPaid] = useState(paidTotal ? String(paidTotal) : "");
  const [saving, setSaving] = useState(false);

  const initialAmount = total ? String(total) : "";
  const initialPaid = paidTotal ? String(paidTotal) : "";

  const save = async () => {
    if (amount === initialAmount && paid === initialPaid) return; // nothing changed
    setSaving(true);
    try {
      const amt = amount === "" ? 0 : Number(amount);
      const paidAmt = paid === "" ? 0 : Number(paid);

      if (amt <= 0) {
        // Cell cleared out — remove the record(s) for this category if allowed.
        if (records.length > 0 && canDelete) {
          await Promise.all(records.map((r) => api.delete(`/fees/${r.id}`)));
        } else if (records.length > 0) {
          await api.put(`/fees/${records[0].id}`, { amount: 0, paid_amount: 0 });
        }
      } else {
        const [target, ...extras] = records;
        if (canDelete && extras.length) {
          await Promise.all(extras.map((r) => api.delete(`/fees/${r.id}`)));
        }
        const payload = { category, title: CATEGORY_LABEL[category], amount: amt, paid_amount: paidAmt };
        if (target) {
          await api.put(`/fees/${target.id}`, payload);
        } else {
          await api.post("/fees", { ...payload, student_id: studentId });
        }
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const due = (Number(amount) || 0) - (Number(paid) || 0);

  return (
    <div className="flex flex-col gap-1 min-w-[110px]">
      <input
        type="number" min="0" placeholder="Amount" value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
        disabled={saving}
        className="form-input !py-1 !px-2 text-xs"
      />
      <input
        type="number" min="0" placeholder="Paid" value={paid}
        onChange={(e) => setPaid(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
        disabled={saving}
        className="form-input !py-1 !px-2 text-xs"
      />
      {amount !== "" && <span className="text-[10px] text-navy-900/40">Due ₹{due.toLocaleString()}</span>}
    </div>
  );
}

function StaffFees() {
  const { user } = useAuth();
  const canDelete = user?.role === "admin";

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/fees"), api.get("/students")])
      .then(([fRes, sRes]) => { setFees(fRes.data); setStudents(sRes.data); })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // One row per student, one column per fee category. Every cell aggregates
  // whatever fee record(s) already exist for that student + category so old
  // duplicate rows (e.g. two "Tuition" entries) collapse into a single
  // editable cell the moment they're saved again.
  const pivotRows = useMemo(() => {
    return students
      .map((s) => {
        const studentFees = fees.filter((f) => f.student_id === s.id);
        const cells = {};
        let totalAmount = 0;
        let totalPaid = 0;
        for (const c of CATEGORIES) {
          const records = studentFees.filter((f) => f.category === c.value);
          cells[c.value] = records;
          totalAmount += records.reduce((sum, r) => sum + Number(r.amount), 0);
          totalPaid += records.reduce((sum, r) => sum + Number(r.paid_amount), 0);
        }
        return { student: s, cells, allFees: studentFees, totalAmount, totalPaid, totalDue: totalAmount - totalPaid };
      })
      .filter((row) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          row.student.name?.toLowerCase().includes(q) ||
          row.student.roll_no?.toLowerCase().includes(q) ||
          (row.student.SchoolClass && `${row.student.SchoolClass.name} ${row.student.SchoolClass.section}`.toLowerCase().includes(q))
        );
      });
  }, [students, fees, search]);

  return (
    <DashboardLayout title="Fee Management">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm">Fill each student's fee amount &amp; paid amount directly, per fee type.</p>
        <input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input max-w-xs"
        />
      </div>

      <div className="card p-4 sm:p-5 overflow-x-auto">
        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                {CATEGORIES.map((c) => <th key={c.value}>{c.label}</th>)}
                <th>Total Due</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {pivotRows.length === 0 && (
                <tr><td colSpan={CATEGORIES.length + 4} className="text-center py-8 text-navy-900/40">No students found.</td></tr>
              )}
              {pivotRows.map((row) => (
                <tr key={row.student.id}>
                  <td className="font-medium align-top pt-3">{row.student.name}</td>
                  <td className="align-top pt-3">
                    {row.student.SchoolClass ? `${row.student.SchoolClass.name} - ${row.student.SchoolClass.section}` : "—"}
                  </td>
                  {CATEGORIES.map((c) => (
                    <td key={c.value} className="align-top">
                      <FeeCell
                        key={`${c.value}-${row.cells[c.value].map((r) => r.id).join(",")}`}
                        studentId={row.student.id}
                        category={c.value}
                        records={row.cells[c.value]}
                        canDelete={canDelete}
                        onSaved={load}
                      />
                    </td>
                  ))}
                  <td className="align-top pt-3 font-semibold">₹{row.totalDue.toLocaleString()}</td>
                  <td className="align-top pt-3">
                    <ConsolidatedReceiptButton fees={row.allFees} student={row.student} studentName={row.student.name} label="" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }) {
  const cls = status === "paid" ? "badge-green" : status === "partial" ? "badge-orange" : "badge-red";
  return <span className={`badge ${cls} capitalize`}>{status}</span>;
}
