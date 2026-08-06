import { useEffect, useState } from "react";
import { Plus, IndianRupee } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import api from "../api/axios";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const emptyForm = { teacher_id: "", month: new Date().getMonth() + 1, year: new Date().getFullYear(), basic_salary: "", allowances: 0, deductions: 0 };

export default function Payroll() {
  const [records, setRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/payroll"), api.get("/teachers")])
      .then(([pRes, tRes]) => { setRecords(pRes.data); setTeachers(tRes.data); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try { await api.post("/payroll", form); setModalOpen(false); setForm(emptyForm); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed to create payroll record."); }
    finally { setSaving(false); }
  };

  const markPaid = async (id) => { await api.put(`/payroll/${id}`, { status: "paid" }); load(); };

  const columns = [
    { key: "teacher", label: "Teacher", exportValue: (r) => r.Teacher?.name, render: (r) => <span className="font-medium">{r.Teacher?.name}</span> },
    { key: "period", label: "Period", exportValue: (r) => `${MONTHS[r.month]} ${r.year}`, render: (r) => `${MONTHS[r.month]} ${r.year}` },
    { key: "basic_salary", label: "Basic", exportValue: (r) => Number(r.basic_salary), render: (r) => `₹${Number(r.basic_salary).toLocaleString()}` },
    { key: "allowances", label: "Allowances", exportValue: (r) => Number(r.allowances), render: (r) => `₹${Number(r.allowances).toLocaleString()}` },
    { key: "deductions", label: "Deductions", exportValue: (r) => Number(r.deductions), render: (r) => `₹${Number(r.deductions).toLocaleString()}` },
    { key: "net_salary", label: "Net Salary", exportValue: (r) => Number(r.net_salary), render: (r) => <span className="font-semibold">₹{Number(r.net_salary).toLocaleString()}</span> },
    { key: "status", label: "Status", render: (r) => <span className={`badge ${r.status === "paid" ? "badge-green" : "badge-orange"} capitalize`}>{r.status}</span> },
  ];

  return (
    <DashboardLayout title="Payroll">
      <div className="flex items-center justify-between mb-4">
        <p className="text-navy-900/50 text-sm flex items-center gap-2"><IndianRupee size={16} /> Manage teacher/staff salary records.</p>
        <button onClick={() => { setForm(emptyForm); setError(""); setModalOpen(true); }} className="btn-primary"><Plus size={16} /> Add Payroll Record</button>
      </div>

      <div className="card p-4 sm:p-5">
        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={records}
            searchPlaceholder="Search payroll..."
            exportFileName="payroll"
            actionsColumn={(r) => r.status !== "paid" && (
              <button onClick={() => markPaid(r.id)} className="btn-outline text-xs">Mark Paid</button>
            )}
          />
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Payroll Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}
          <div><label className="form-label">Teacher</label>
            <select required value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} className="form-input">
              <option value="">Select teacher</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Month</label>
              <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} className="form-input">
                {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div><label className="form-label">Year</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="form-input" /></div>
          </div>
          <div><label className="form-label">Basic salary (₹)</label><input type="number" required value={form.basic_salary} onChange={(e) => setForm({ ...form, basic_salary: e.target.value })} className="form-input" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Allowances (₹)</label><input type="number" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} className="form-input" /></div>
            <div><label className="form-label">Deductions (₹)</label><input type="number" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} className="form-input" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save"}</button></div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
