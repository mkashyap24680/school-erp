import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Wallet,
  Building2,
  CalendarDays,
  Layers3,
  Megaphone,
  ArrowRight,
  Clock,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState(null);
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
      api.get("/announcements"),
    ];

    Promise.all(requests)
      .then(([statsRes, announcementsRes]) => {
        setStats(statsRes.data);

        // Get latest announcement only
        const announcements = announcementsRes?.data || [];

        const sortedAnnouncements = [...announcements].sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        setLatestAnnouncement(
          sortedAnnouncements[0] || null
        );
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
                  <div className="rounded-xl border border-[#eef0f4] p-5 text-sm text-navy-900/50">
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

              {/* Current Announcement */}
              <CurrentAnnouncement
                announcement={latestAnnouncement}
                loading={loading}
              />

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
  // ADMIN / MANAGEMENT / TEACHER / OTHER DASHBOARD
  // --------------------------------------------------

  return (
    <DashboardLayout
      title={`Welcome, ${
        user?.name?.split(" ")[0] || ""
      }`}
    >
      <div className="space-y-6">

        {/* Other roles */}
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

        {canSeeStats && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

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

            {/* Current Announcement + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Current Announcement */}
              <CurrentAnnouncement
                announcement={latestAnnouncement}
                loading={loading}
                large
              />

              {/* Quick Links */}
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

        {/* Announcement for users who cannot see statistics */}
        {!canSeeStats && (
          <CurrentAnnouncement
            announcement={latestAnnouncement}
            loading={loading}
          />
        )}

      </div>
    </DashboardLayout>
  );
}

// --------------------------------------------------
// CURRENT ANNOUNCEMENT
// --------------------------------------------------

function CurrentAnnouncement({
  announcement,
  loading,
  large = false,
}) {
  return (
    <div
      className={`card p-5 ${
        large ? "lg:col-span-2" : ""
      }`}
    >

      {/* Header */}
      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-[#e7f7ea] text-[#2f9e44] flex items-center justify-center shrink-0">
            <Megaphone size={22} />
          </div>

          <div>
            <h3 className="font-bold text-navy-900 text-lg">
              Current Announcement
            </h3>

            <p className="text-sm text-navy-900/50">
              Latest school announcement
            </p>
          </div>

        </div>

        <Link
          to="/announcements"
          className="text-brand-600 font-semibold text-sm hover:underline flex items-center gap-1 shrink-0"
        >
          View All
          <ArrowRight size={16} />
        </Link>

      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-sm text-navy-900/40 py-6 text-center">
          Loading announcement...
        </div>
      ) : !announcement ? (
        /* No announcement */
        <div className="rounded-xl border border-[#eef0f4] p-6 text-center text-sm text-navy-900/40">
          No current announcements.
        </div>
      ) : (
        /* Latest Announcement */
        <div className="rounded-xl border border-[#eef0f4] p-5">

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0">

              {/* Title + Priority */}
              <div className="flex items-center gap-2 flex-wrap mb-2">

                <h4 className="text-lg font-bold text-navy-900">
                  {announcement.title}
                </h4>

                <span
                  className={`badge ${
                    announcement.priority === "urgent"
                      ? "badge-red"
                      : announcement.priority === "important"
                      ? "badge-orange"
                      : "badge-gray"
                  } capitalize`}
                >
                  {announcement.priority}
                </span>

              </div>

              {/* Message */}
              <p className="text-sm text-navy-900/70 whitespace-pre-wrap">
                {announcement.message}
              </p>

              {/* Date + Audience */}
              <div className="flex items-center gap-4 mt-4 text-xs text-navy-900/50">

                <span className="flex items-center gap-1">
                  <Clock size={14} />

                  {new Date(
                    announcement.created_at
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>

                <span className="flex items-center gap-1">
                  <Users size={14} />

                  {announcement.target_role === "all"
                    ? "Everyone"
                    : announcement.target_role}
                </span>

              </div>

            </div>

            {/* Right Icon */}
            <div className="w-11 h-11 rounded-xl bg-[#e7f7ea] text-[#2f9e44] flex items-center justify-center shrink-0">
              <Megaphone size={20} />
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// --------------------------------------------------
// ACADEMIC INFORMATION CARD
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
// QUICK LINK
// --------------------------------------------------

function QuickLink({ label, to }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-navy-900/70 hover:bg-[#f8f9fb] hover:text-brand-600 transition-colors"
      >
        <span>{label}</span>

        <span className="text-brand-600">
          →
        </span>
      </Link>
    </li>
  );
}
