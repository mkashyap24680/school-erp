import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { Users, Wallet, CalendarCheck, BookOpen } from "lucide-react";

const FEE_COLORS = { paid: "#2f9e44", partial: "#e8a33d", unpaid: "#e5484d" };

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [classes, setClasses] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/dashboard/attendance-trend"),
      api.get("/classes"),
      api.get("/fees"),
    ])
      .then(([statsRes, trendRes, classesRes, feesRes]) => {
        setStats(statsRes.data);
        setTrend(trendRes.data.map((d) => ({ ...d, day: d.date.slice(5) })));
        setClasses(classesRes.data);
        setFees(feesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const classDistribution = classes.map((c) => ({
    name: `${c.name}${c.section}`,
    students: c.studentCount || 0,
  }));

  const feeStatusCounts = ["paid", "partial", "unpaid"].map((status) => ({
    name: status,
    value: fees.filter((f) => f.status === status).length,
  })).filter((d) => d.value > 0);

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Students" value={loading ? "…" : stats?.students ?? 0} color="brand" />
        <StatCard icon={BookOpen} label="Total Classes" value={loading ? "…" : stats?.classes ?? 0} color="purple" />
        <StatCard icon={CalendarCheck} label="Attendance Today" value={loading ? "…" : `${stats?.attendancePercent ?? 0}%`} color="orange" />
        <StatCard icon={Wallet} label="Pending Fee Records" value={loading ? "…" : stats?.pendingFees ?? 0} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-bold text-navy-900 mb-4">Students per Class</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={classDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9aa1af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9aa1af" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="students" fill="#2f9e44" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-navy-900 mb-4">Fee Collection Status</h3>
          {feeStatusCounts.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-navy-900/40 text-sm">No fee data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={feeStatusCounts} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {feeStatusCounts.map((entry) => (
                    <Cell key={entry.name} fill={FEE_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h3 className="font-bold text-navy-900 mb-4">Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef0f4" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9aa1af" />
              <YAxis tick={{ fontSize: 12 }} stroke="#9aa1af" unit="%" />
              <Tooltip />
              <Bar dataKey="percent" fill="#1e3465" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
}
