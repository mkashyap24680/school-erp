import { useEffect, useState } from "react";
import { CalendarCheck, Save } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["present", "absent", "leave"];

export default function Attendance() {
  const { user } = useAuth();

  if (user?.role === "student") return <StudentAttendance />;
  return <StaffAttendance />;
}

function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/attendance/me").then((res) => setRecords(res.data)).finally(() => setLoading(false));
  }, []);

  const presentCount = records.filter((r) => r.status === "present").length;
  const percent = records.length ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <DashboardLayout title="My Attendance">
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
          <CalendarCheck size={26} />
        </div>
        <div>
          <div className="text-2xl font-bold text-navy-900">{percent}%</div>
          <div className="text-sm text-navy-900/50">Overall attendance ({records.length} days recorded)</div>
        </div>
      </div>

      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={2} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {!loading && records.length === 0 && (
              <tr><td colSpan={2} className="text-center py-8 text-navy-900/40">No attendance records yet.</td></tr>
            )}
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td><StatusBadge status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

function StaffAttendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/classes").then((res) => {
      setClasses(res.data);
      if (res.data.length) setClassId(String(res.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!classId) return;
    setLoading(true);
    setMessage("");
    Promise.all([
      api.get("/students"),
      api.get("/attendance", { params: { class_id: classId, date } }),
    ]).then(([sRes, aRes]) => {
      const classStudents = sRes.data.filter((s) => String(s.class_id) === String(classId));
      setStudents(classStudents);
      const map = {};
      classStudents.forEach((s) => (map[s.id] = "present"));
      aRes.data.forEach((a) => (map[a.student_id] = a.status));
      setStatusMap(map);
    }).finally(() => setLoading(false));
  }, [classId, date]);

  const setStatus = (studentId, status) => setStatusMap({ ...statusMap, [studentId]: status });

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const records = students.map((s) => ({ student_id: s.id, status: statusMap[s.id] || "present" }));
      await api.post("/attendance/bulk", { class_id: classId, date, records });
      setMessage("Attendance saved successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Attendance">
      <div className="card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-4 sm:items-end">
        <div className="flex-1">
          <label className="form-label">Class</label>
          <select value={classId} onChange={(e) => setClassId(e.target.value)} className="form-input">
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name} {c.section}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="form-label">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
        </div>
        <button onClick={handleSave} disabled={saving || !students.length} className="btn-primary">
          <Save size={16} /> {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {message && (
        <div className="mb-4 text-sm bg-brand-100 text-brand-600 border border-brand-100 rounded-lg px-3 py-2">
          {message}
        </div>
      )}

      <div className="card p-4 sm:p-5 overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Student</th><th>Roll No</th><th>Status</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan={3} className="text-center py-8 text-navy-900/40">Loading...</td></tr>}
            {!loading && students.length === 0 && (
              <tr><td colSpan={3} className="text-center py-8 text-navy-900/40">No students in this class.</td></tr>
            )}
            {students.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td>{s.roll_no || "—"}</td>
                <td>
                  <div className="flex gap-1.5">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setStatus(s.id, opt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${
                          statusMap[s.id] === opt
                            ? opt === "present" ? "bg-brand-500 text-white border-brand-500"
                              : opt === "absent" ? "bg-red-500 text-white border-red-500"
                              : "bg-orange-400 text-white border-orange-400"
                            : "bg-white text-navy-900/60 border-[#e2e5ea]"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }) {
  const cls = status === "present" ? "badge-green" : status === "absent" ? "badge-red" : "badge-orange";
  return <span className={`badge ${cls} capitalize`}>{status}</span>;
}
