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
  Bell,
  Megaphone,
  Clock,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isStudent = user?.role === "student";

  const canSeeStats = [
    "admin",
    "management",
    "teacher",
  ].includes(user?.role);

  useEffect(() => {
    setLoading(true);

    api
      .get("/dashboard/stats")
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error("Dashboard loading error:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.role]);

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
                      {student?.name ||
                        user?.name ||
                        "Student"}
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
                  <div className="rounded-xl border border-[#eef0f4] dark:border-[#1e2947] p-5 text-sm text-navy-900/50">
                    No class has been assigned to your
                    student profile yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    <AcademicInfo
                      icon={GraduationCap}
                      label="Course"
                      value={
                        academic.course_name || "—"
                      }
                    />

                    <AcademicInfo
                      icon={Building2}
                      label="Department"
                      value={
                        academic.department_name || "—"
                      }
                    />

                    <AcademicInfo
                      icon={Layers3}
                      label="Year"
                      value={
                        academic.year || "—"
                      }
                    />

                    <AcademicInfo
                      icon={CalendarDays}
                      label="Semester"
                      value={
                        academic.semester || "—"
                      }
                    />

                    <AcademicInfo
                      icon={CalendarDays}
                      label="Session"
                      value={
                        academic.session || "—"
                      }
                    />

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

      {/* ---------------------------------------------- */}
      {/* User without dashboard statistics */}
      {/* ---------------------------------------------- */}

      {!canSeeStats && (
        <div className="card p-5">

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

      {/* ---------------------------------------------- */}
      {/* Admin / Management / Teacher */}
      {/* ---------------------------------------------- */}

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

          {/* ------------------------------------------ */}
          {/* Announcements + Quick Links */}
          {/* ------------------------------------------ */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Announcements */}
            <div className="card p-5 lg:col-span-2">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
                    <Megaphone size={20} />
                  </div>

                  <div>
                    <h3 className="font-bold text-navy-900">
                      Announcements
                    </h3>

                    <p className="text-xs text-navy-900/50 mt-0.5">
                      Latest school announcements
                    </p>
                  </div>

                </div>

                <Link
                  to="/announcements"
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  View All →
                </Link>

              </div>

              {/* Announcement List */}
              <div className="space-y-3">

                <AnnouncementItem
                  title="Semester Examination Schedule Released"
                  description="The examination schedule for the upcoming semester has been published. Please check the examination section for complete details."
                  date="Aug 10, 2026"
                  audience="All"
                  priority="Important"
                />

                <AnnouncementItem
                  title="Independence Day Holiday"
                  description="The school will remain closed on August 15 due to Independence Day."
                  date="Aug 09, 2026"
                  audience="All"
                  priority="Normal"
                />

                <AnnouncementItem
                  title="Faculty Meeting"
                  description="Monthly faculty meeting will be held at 3:00 PM in the conference room."
                  date="Aug 08, 2026"
                  audience="Teachers"
                  priority="Important"
                />

                <AnnouncementItem
                  title="Fee Payment Reminder"
                  description="Students with pending fees are requested to complete their fee payment before the due date."
                  date="Aug 07, 2026"
                  audience="Students"
                  priority="Urgent"
                />

              </div>

            </div>

            {/* Quick Links */}
            <div className="card p-5">

              <div className="flex items-center gap-2 mb-4">

                <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
                  <Bell size={18} />
                </div>

                <h3 className="font-bold text-navy-900">
                  Quick Links
                </h3>

              </div>

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
// Academic Information Card
// --------------------------------------------------

function AcademicInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[#eef0f4] dark:border-[#1e2947] p-4">

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
// Announcement Item
// --------------------------------------------------

function AnnouncementItem({
  title,
  description,
  date,
  audience,
  priority,
}) {
  const priorityClass = {
    Normal:
      "bg-gray-100 text-gray-600 dark:bg-[#1e2947] dark:text-[#9aa4c4]",

    Important:
      "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",

    Urgent:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300",
  };

  return (
    <div className="rounded-xl border border-[#eef0f4] dark:border-[#1e2947] p-4 hover:border-brand-500 dark:hover:border-brand-400 transition-colors">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <div className="flex items-center gap-2 flex-wrap">

            <h4 className="font-semibold text-navy-900">
              {title}
            </h4>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${priorityClass[priority]}`}
            >
              {priority}
            </span>

          </div>

          <p className="text-sm text-navy-900/60 mt-1.5 leading-5">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-navy-900/50">

            <span className="flex items-center gap-1">
              <Clock size={13} />
              {date}
            </span>

            <span className="flex items-center gap-1">
              <Users size={13} />
              {audience}
            </span>

          </div>

        </div>

        <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center">
          <Megaphone size={15} />
        </div>

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
        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-navy-900/70 hover:bg-[#f7f8fa] dark:hover:bg-[#17203e] hover:text-navy-900 transition-colors"
      >
        <span>{label}</span>

        <span className="text-brand-600">
          →
        </span>
      </Link>
    </li>
  );
}
