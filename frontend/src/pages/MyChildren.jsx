import { useEffect, useState } from "react";
import { Users, CalendarCheck, Wallet, FileText } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import MarksheetButton from "../components/MarksheetButton";
import api from "../api/axios";

export default function MyChildren() {
  const [children, setChildren] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("attendance");
  const [tabData, setTabData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    api.get("/parent/children").then((res) => {
      setChildren(res.data);
      if (res.data.length) setSelected(res.data[0]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setTabLoading(true);
    api.get(`/parent/children/${selected.id}/${tab}`)
      .then((res) => setTabData(res.data))
      .finally(() => setTabLoading(false));
  }, [selected, tab]);

  if (loading) {
    return <DashboardLayout title="My Children"><div className="text-navy-900/40 text-sm">Loading...</div></DashboardLayout>;
  }

  if (children.length === 0) {
    return (
      <DashboardLayout title="My Children">
        <div className="card p-8 text-center text-navy-900/40 text-sm">
          No children are linked to your account yet. Please contact the school administrator to link your child's profile.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Children">
      <div className="flex flex-wrap gap-2 mb-6">
        {children.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
              selected?.id === c.id ? "bg-navy-900 text-white" : "bg-white border border-[#e2e5ea] text-navy-900/70"
            }`}
          >
            <Users size={15} /> {c.name} {c.SchoolClass ? `(${c.SchoolClass.name}${c.SchoolClass.section})` : ""}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { key: "attendance", label: "Attendance", icon: CalendarCheck },
          { key: "fees", label: "Fees", icon: Wallet },
          { key: "results", label: "Exam Results", icon: FileText },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              tab === key ? "bg-brand-500 text-white" : "bg-[#f0f2f5] text-navy-900/60"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="card p-4 sm:p-5 overflow-x-auto">
        {tab === "results" && selected && (
          <div className="flex justify-end mb-3">
            <MarksheetButton studentId={selected.id} studentName={selected.name} fetchUrl={`/parent/children/${selected.id}/results`} />
            <span className="text-xs text-navy-900/40 ml-2 self-center">Download marksheet</span>
          </div>
        )}
        {tabLoading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">Loading...</div>
        ) : tab === "attendance" ? (
          <table className="data-table">
            <thead><tr><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {tabData.length === 0 && <tr><td colSpan={2} className="text-center py-8 text-navy-900/40">No records yet.</td></tr>}
              {tabData.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td><span className={`badge ${r.status === "present" ? "badge-green" : r.status === "absent" ? "badge-red" : "badge-orange"} capitalize`}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : tab === "fees" ? (
          <table className="data-table">
            <thead><tr><th>Title</th><th>Amount</th><th>Paid</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {tabData.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-navy-900/40">No fee records yet.</td></tr>}
              {tabData.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.title}</td>
                  <td>₹{Number(f.amount).toLocaleString()}</td>
                  <td>₹{Number(f.paid_amount).toLocaleString()}</td>
                  <td>{f.due_date || "—"}</td>
                  <td><span className={`badge ${f.status === "paid" ? "badge-green" : f.status === "partial" ? "badge-orange" : "badge-red"} capitalize`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Marks</th></tr></thead>
            <tbody>
              {tabData.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-navy-900/40">No results published yet.</td></tr>}
              {tabData.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium">{r.Exam?.name}</td>
                  <td>{r.Exam?.subject}</td>
                  <td>{r.Exam?.exam_date || "—"}</td>
                  <td>{r.marks_obtained} / {r.Exam?.total_marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
