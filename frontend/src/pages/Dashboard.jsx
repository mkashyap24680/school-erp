import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, GraduationCap, BookOpen, CalendarCheck, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const canSeeStats = ["admin", "management", "teacher"].includes(user?.role);

  useEffect(() => {
    if (!canSeeStats) {
      setLoading(false);
      return;
    }
    Promise.all([api.get("/dashboard/stats"), api.get("/dashboard/attendance-trend")])
      .then(([statsRes, trendRes]) => {
        setStats(statsRes.data);
        setTrend(trendRes.data.map((d) => ({ ...d, day: d.date.slice(5) })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [canSeeStats]);

  return (
    <DashboardLayout title={`Welcome, ${user?.name?.split(" ")[0] || ""}`}>
      {!canSeeStats && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-navy-900 text-lg mb-1">
            {user?.role === "student" ? "Student Dashboard" : user?.role === "parent" ? "Parent Dashboard" : "Dashboard"}
          </h2>
          <p className="text-navy-900/60 text-sm mb-4">
            {user?.role === "parent"
              ? "View your child's attendance, fees and exam results, and check school announcements."
              : "Use the sidebar to view your classes, attendance, exam results and fee status."}
          </p>
          {user?.role === "parent" && (
            <Link to="/my-children" className="btn-primary inline-flex">View My Children →</Link>
          )}
        </div>
      )}

      {canSeeStats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <StatCard icon={Users} label="Students" value={loading ? "…" : stats?.students ?? 0} color="brand" />
            <StatCard icon={GraduationCap} label="Teachers" value={loading ? "…" : stats?.teachers ?? 0} color="blue" />
            <StatCard icon={BookOpen} label="Classes" value={loading ? "…" : stats?.classes ?? 0} color="purple" />
            <StatCard
              icon={CalendarCheck}
              label="Attendance Today"
              value={loading ? "…" : `${stats?.attendancePercent ?? 0}%`}
              color="orange"
            />
            <StatCard icon={Wallet} label="Pending Fees" value={loading ? "…" : stats?.pendingFees ?? 0} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-bold text-navy-900 mb-4">Attendance Overview (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9aa1af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9aa1af" unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="percent" stroke="#2f9e44" strokeWidth={2.5} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">
              <h3 className="font-bold text-navy-900 mb-4">Quick Links</h3>
              <ul className="space-y-3 text-sm">
                <QuickLink label="Add new student" to="/students" />
                <QuickLink label="Mark today's attendance" to="/attendance" />
                <QuickLink label="Record fee payment" to="/fees" />
                <QuickLink label="Create an exam" to="/exams" />
                <QuickLink label="View reports" to="/reports" />
              </ul>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function QuickLink({ label, to }) {
  return (
    <li>
      <Link to={to} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f7f8fa] hover:bg-brand-100 text-navy-900 font-medium">
        {label}
        <span className="text-brand-600">→</span>
      </Link>
    </li>
  );
}
