import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Wallet,
  UserRound,
  Building2,
  CalendarDays,
  Layers3,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const isStudent = user?.role === "student";

  const canSeeStats = [
    "admin",
    "management",
    "teacher",
  ].includes(user?.role);

  useEffect(() => {
    setLoading(true);

    const requests = [
      api.get("/dashboard/stats"),
    ];

    // Attendance chart sirf admin/management/teacher ke liye
    if (canSeeStats) {
      requests.push(
        api.get("/dashboard/attendance-trend")
      );
    }

    Promise.all(requests)
      .then(([statsRes, trendRes]) => {
        setStats(statsRes.data);

        if (trendRes) {
          setTrend(
            trendRes.data.map((d) => ({
              ...d,
              day: d.date.slice(5),
            }))
          );
        } else {
          setTrend([]);
        }
      })
      .catch((err) => {
        console.error("Dashboard loading error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.role, canSeeStats]);

  // --------------------------------------------------
  // STUDENT DASHBOARD
  // --------------------------------------------------

  if (isStudent) {
    const student = stats?.student;
    const academic = stats?.currentAcademic;

    return (
      <DashboardLayout
        title={`Welcome, ${
          user?.name?.split(" ")[0] || ""
        }`}
      >
        <div className="space-y-6">

          {/* Student Welcome */}
          <div className="card p-5">
            <h2 className="text-xl font-bold text-navy-900">
              Student Dashboard
            </h2>

            <p className="text-sm text-navy-900/50 mt-1">
              View your current academic information.
            </p>
          </div>

          {loading ? (
            <div className="card p-8 text-center text-sm text-navy-900/40">
              Loading student information...
            </div>
          ) : (
            <>
              {/* Student Profile */}
              <div className="card p-5">
                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-full bg-[#e7f7ea] text-[#2f9e44] flex items-center justify-center text-xl font-bold">
                    {student?.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "ST"}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-navy-900">
                      {student?.name || user?.name || "Student"}
                    </h3>

                    {student?.roll_no && (
                      <p className="text-sm text-navy-900/50">
                        Roll No:{" "}
                        <span className="font-semibold text-navy-900">
                          {student.roll_no}
                        </span>
                      </p>
                    )}

                    {student?.admission_no && (
                      <p className="text-sm text-navy-900/50">
                        Admission No:{" "}
                        <span className="font-semibold text-navy-900">
                          {student.admission_no}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Academic Information */}
              <div className="card p-5">

                <div className="flex items-center gap-2 mb-5">
                  <GraduationCap
                    size={20}
                    className="text-[#2f9e44]"
                  />

                  <div>
                    <h3 className="font-bold text-navy-900">
                      Current Academic Information
                    </h3>

                    <p className="text-xs text-navy-900/50">
                      Your current course and class
                    </p>
                  </div>
                </div>

                {!academic ? (
                  <div className="rounded-xl border border-[#eef0f4] p-5 text-sm text-navy-900/50">
                    No class has been assigned to your
                    student profile yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Course */}
                    <AcademicInfo
                      icon={GraduationCap}
                      label="Course"
                      value={
                        academic.course_name || "—"
                      }
                    />

                    {/* Department */}
                    <AcademicInfo
                      icon={Building2}
                      label="Department"
                      value={
                        academic.department_name || "—"
                      }
                    />

                    {/* Year */}
                    <AcademicInfo
                      icon={Layers3}
                      label="Year"
                      value={
                        academic.year || "—"
                      }
                    />

                    {/* Semester */}
                    <AcademicInfo
                      icon={CalendarDays}
                      label="Semester"
                      value={
                        academic.semester || "—"
                      }
                    />

                    {/* Session */}
                    <AcademicInfo
                      icon={CalendarDays}
                      label="Session"
                      value={
                        academic.session || "—"
                      }
                    />

                    {/* Section */}
                    <AcademicInfo
                      icon={Users}
                      label="Section"
                      value={
                        academic.section
                          ? `Section ${academic.section}`
                          : "—"
                      }
                    />
                  </div>
                )}
              </div>

              {/* Quick Links */}
              <div className="card p-5">

                <h3 className="font-bold text-navy-900 mb-4">
                  Quick Links
                </h3>

                <ul className="space-y-3 text-sm">

                  <QuickLink
                    label="View my attendance"
                    to="/attendance"
                  />

                  <QuickLink
                    label="View exam results"
                    to="/exams"
                  />

                  <QuickLink
                    label="View fees"
                    to="/fees"
                  />

                  <QuickLink
                    label="View homework"
                    to="/homework"
                  />

                </ul>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // --------------------------------------------------
  // ADMIN / MANAGEMENT / TEACHER DASHBOARD
  // --------------------------------------------------

  return (
    <DashboardLayout
      title={`Welcome, ${
        user?.name?.split(" ")[0] || ""
      }`}
    >
      {!canSeeStats && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-navy-900">
            Dashboard
          </h2>

          <p className="text-sm text-navy-900/50 mt-1">
            Use the sidebar to view your available
            modules.
          </p>

          {user?.role === "parent" && (
            <div className="mt-4">
              <Link
                to="/parents"
                className="btn-primary inline-flex"
              >
                View My Children →
              </Link>
            </div>
          )}
        </div>
      )}

      {canSeeStats && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">

            <StatCard
              icon={Users}
              label="Students"
              value={
                loading
                  ? "…"
                  : stats?.students ?? 0
              }
              color="brand"
            />

            <StatCard
              icon={GraduationCap}
              label="Teachers"
              value={
                loading
                  ? "…"
                  : stats?.teachers ?? 0
              }
              color="blue"
            />

            <StatCard
              icon={BookOpen}
              label="Classes"
              value={
                loading
                  ? "…"
                  : stats?.classes ?? 0
              }
              color="purple"
            />

            <StatCard
              icon={CalendarCheck}
              label="Attendance Today"
              value={
                loading
                  ? "…"
                  : `${stats?.attendancePercent ?? 0}%`
              }
              color="orange"
            />

            <StatCard
              icon={Wallet}
              label="Pending Fees"
              value={
                loading
                  ? "…"
                  : stats?.pendingFees ?? 0
              }
              color="red"
            />
          </div>

          {/* Attendance + Quick Links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="card p-5 lg:col-span-2">

              <h3 className="font-bold text-navy-900 mb-4">
                Attendance Overview (Last 7 Days)
              </h3>

              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <LineChart data={trend}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#eef0f4"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    stroke="#9aa1af"
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9aa1af"
                    unit="%"
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="percent"
                    stroke="#2f9e44"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />

                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5">

              <h3 className="font-bold text-navy-900 mb-4">
                Quick Links
              </h3>

              <ul className="space-y-3 text-sm">

                <QuickLink
                  label="Add new student"
                  to="/students"
                />

                <QuickLink
                  label="Mark today's attendance"
                  to="/attendance"
                />

                <QuickLink
                  label="Record fee payment"
                  to="/fees"
                />

                <QuickLink
                  label="Create an exam"
                  to="/exams"
                />

                <QuickLink
                  label="View reports"
                  to="/reports"
                />

              </ul>
            </div>

          </div>
        </>
      )}
    </DashboardLayout>
  );
}

// --------------------------------------------------
// Academic information card
// --------------------------------------------------

function AcademicInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#eef0f4] p-4">

      <div className="flex items-center gap-2 mb-2">

        <Icon
          size={16}
          className="text-[#2f9e44]"
        />

        <span className="text-xs font-medium text-navy-900/50">
          {label}
        </span>

      </div>

      <div className="font-semibold text-navy-900">
        {value}
      </div>

    </div>
  );
}

// --------------------------------------------------
// Quick Link
// --------------------------------------------------

function QuickLink({ label, to }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/70"
      >
        <span>{label}</span>
        <span>→</span>
      </Link>
    </li>
  );
}
