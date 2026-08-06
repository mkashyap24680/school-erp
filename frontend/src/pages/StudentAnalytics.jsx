import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";

export default function StudentAnalytics() {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [results, setResults] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/students").then((res) => {
      setStudents(res.data);
      if (res.data.length) setStudentId(String(res.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    Promise.all([
      api.get(`/exams/results/student/${studentId}`),
      api.get("/attendance", { params: { student_id: studentId } }),
    ]).then(([rRes, aRes]) => {
      setResults(rRes.data);
      setAttendance(aRes.data);
    }).finally(() => setLoading(false));
  }, [studentId]);

  const scoreTrend = results
    .filter((r) => r.Exam)
    .sort((a, b) => new Date(a.Exam.exam_date || 0) - new Date(b.Exam.exam_date || 0))
    .map((r) => ({
      name: r.Exam.name,
      percent: r.Exam.total_marks ? Math.round((r.marks_obtained / r.Exam.total_marks) * 100) : 0,
    }));

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendancePercent = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;
  const avgScore = scoreTrend.length ? Math.round(scoreTrend.reduce((s, r) => s + r.percent, 0) / scoreTrend.length) : 0;

  return (
    <DashboardLayout title="Student Performance Analytics">
      <div className="card p-4 mb-6">
        <label className="form-label">Select student</label>
        <select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="form-input max-w-sm">
          {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-navy-900/40 text-sm">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card p-5">
              <div className="text-xs text-navy-900/50 font-medium mb-1">Average Exam Score</div>
              <div className="text-2xl font-bold text-navy-900">{avgScore}%</div>
            </div>
            <div className="card p-5">
              <div className="text-xs text-navy-900/50 font-medium mb-1">Overall Attendance</div>
              <div className="text-2xl font-bold text-navy-900">{attendancePercent}%</div>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><TrendingUp size={16} /> Exam Score Trend</h3>
            {scoreTrend.length === 0 ? (
              <div className="text-navy-900/40 text-sm text-center py-10">No exam results yet for this student.</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9aa1af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9aa1af" unit="%" domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percent" stroke="#2f9e44" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
