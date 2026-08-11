import { useEffect, useMemo, useState } from "react";
import {
  User,
  GraduationCap,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Students() {
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudentData = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileRes, attendanceRes] = await Promise.all([
        api.get("/students/me/profile"),
        api.get("/attendance/me"),
      ]);

      setStudent(profileRes.data || null);
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      console.error("Student portal load error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your student data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "student") {
      loadStudentData();
    }
  }, [user?.role]);

  // ---------------------------------------
  // Attendance summary
  // ---------------------------------------

  const attendanceSummary = useMemo(() => {
    const total = attendance.length;

    const present = attendance.filter(
      (item) => item.status === "present"
    ).length;

    const absent = attendance.filter(
      (item) => item.status === "absent"
    ).length;

    const leave = attendance.filter(
      (item) => item.status === "leave"
    ).length;

    const percentage = total
      ? Math.round((present / total) * 100)
      : 0;

    return {
      total,
      present,
      absent,
      leave,
      percentage,
    };
  }, [attendance]);

  // ---------------------------------------
  // Class
  // ---------------------------------------

  const studentClass = student?.SchoolClass;

  const className = studentClass
    ? [
        studentClass.course_name,
        studentClass.department_name,
      ]
        .filter(Boolean)
        .join(" — ")
    : "Class not assigned";

  const classDetails = studentClass
    ? [
        studentClass.year,
        studentClass.semester,
        studentClass.session,
        studentClass.section
          ? `Section ${studentClass.section}`
          : null,
      ]
        .filter(Boolean)
        .join(" — ")
    : "";

  // ---------------------------------------
  // Format attendance date
  // ---------------------------------------

  const formatDate = (date) => {
    if (!date) return "—";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return date;
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ---------------------------------------
  // Loading
  // ---------------------------------------

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-sm text-navy-900/50">
            <RefreshCw
              size={16}
              className="animate-spin"
            />
            Loading your data...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------
  // Error
  // ---------------------------------------

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-12">
          <div className="rounded-xl border border-red-100 bg-red-50 p-5">
            <div className="font-semibold text-red-700">
              Unable to load student data
            </div>

            <div className="text-sm text-red-600 mt-1">
              {error}
            </div>

            <button
              onClick={loadStudentData}
              className="btn-primary mt-4 flex items-center gap-2"
            >
              <RefreshCw size={15} />
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ---------------------------------------
  // Main Student Portal
  // ---------------------------------------

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy-900">
              My Student Portal
            </h1>

            <p className="text-sm text-navy-900/50 mt-1">
              View your class and attendance information.
            </p>
          </div>

          <button
            onClick={loadStudentData}
            className="btn-outline flex items-center gap-2 w-fit"
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* -------------------------------- */}
        {/* Student Profile */}
        {/* -------------------------------- */}

        <div className="border border-[#eef0f4] rounded-xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-navy-900/5 flex items-center justify-center shrink-0">
              <User
                size={25}
                className="text-navy-900/60"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-navy-900">
                {student?.name || "Student"}
              </h2>

              <p className="text-sm text-navy-900/50 mt-0.5">
                {student?.email || "—"}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-navy-900/60">
                <span>
                  Roll No:{" "}
                  <b className="text-navy-900">
                    {student?.roll_no || "—"}
                  </b>
                </span>

                <span>
                  Admission No:{" "}
                  <b className="text-navy-900">
                    {student?.admission_no || "—"}
                  </b>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------- */}
        {/* My Class */}
        {/* -------------------------------- */}

        <div className="border border-[#eef0f4] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap
              size={19}
              className="text-navy-900/60"
            />

            <div>
              <h2 className="font-semibold text-navy-900">
                My Class
              </h2>

              <p className="text-xs text-navy-900/50">
                Your current academic class
              </p>
            </div>
          </div>

          {!studentClass ? (
            <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-4 text-sm text-yellow-800">
              No class has been assigned to your student
              profile yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-navy-900/5 p-4">
                <div className="text-xs text-navy-900/50">
                  Course
                </div>

                <div className="font-semibold text-navy-900 mt-1">
                  {studentClass.course_name || "—"}
                </div>
              </div>

              <div className="rounded-lg bg-navy-900/5 p-4">
                <div className="text-xs text-navy-900/50">
                  Department
                </div>

                <div className="font-semibold text-navy-900 mt-1">
                  {studentClass.department_name || "—"}
                </div>
              </div>

              <div className="rounded-lg bg-navy-900/5 p-4">
                <div className="text-xs text-navy-900/50">
                  Year / Semester
                </div>

                <div className="font-semibold text-navy-900 mt-1">
                  {[
                    studentClass.year,
                    studentClass.semester,
                  ]
                    .filter(Boolean)
                    .join(" — ") || "—"}
                </div>
              </div>

              <div className="rounded-lg bg-navy-900/5 p-4">
                <div className="text-xs text-navy-900/50">
                  Session / Section
                </div>

                <div className="font-semibold text-navy-900 mt-1">
                  {[
                    studentClass.session,
                    studentClass.section
                      ? `Section ${studentClass.section}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" — ") || "—"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* -------------------------------- */}
        {/* Attendance */}
        {/* -------------------------------- */}

        <div className="border border-[#eef0f4] rounded-xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck
                size={19}
                className="text-navy-900/60"
              />

              <div>
                <h2 className="font-semibold text-navy-900">
                  My Attendance
                </h2>

                <p className="text-xs text-navy-900/50">
                  Your attendance record only
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-navy-900">
                {attendanceSummary.percentage}%
              </div>

              <div className="text-xs text-navy-900/50">
                Attendance
              </div>
            </div>
          </div>

          {/* Attendance cards */}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="rounded-lg border border-[#eef0f4] p-4">
              <div className="flex items-center gap-2 text-xs text-navy-900/50">
                <Clock3 size={14} />
                Total
              </div>

              <div className="text-xl font-bold text-navy-900 mt-2">
                {attendanceSummary.total}
              </div>
            </div>

            <div className="rounded-lg border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2 text-xs text-green-700">
                <CheckCircle2 size={14} />
                Present
              </div>

              <div className="text-xl font-bold text-green-700 mt-2">
                {attendanceSummary.present}
              </div>
            </div>

            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-2 text-xs text-red-700">
                <XCircle size={14} />
                Absent
              </div>

              <div className="text-xl font-bold text-red-700 mt-2">
                {attendanceSummary.absent}
              </div>
            </div>

            <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4">
              <div className="flex items-center gap-2 text-xs text-yellow-700">
                <Clock3 size={14} />
                Leave
              </div>

              <div className="text-xl font-bold text-yellow-700 mt-2">
                {attendanceSummary.leave}
              </div>
            </div>
          </div>

          {/* Attendance percentage bar */}

          <div className="mb-5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-navy-900/50">
                Attendance percentage
              </span>

              <span className="font-semibold text-navy-900">
                {attendanceSummary.percentage}%
              </span>
            </div>

            <div className="h-2 rounded-full bg-navy-900/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-navy-900 transition-all"
                style={{
                  width: `${Math.min(
                    attendanceSummary.percentage,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Attendance table */}

          {attendance.length === 0 ? (
            <div className="text-center py-8 text-sm text-navy-900/40">
              No attendance records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#eef0f4]">
                    <th className="text-left py-3 px-3 font-semibold text-navy-900">
                      Date
                    </th>

                    <th className="text-left py-3 px-3 font-semibold text-navy-900">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-[#eef0f4] last:border-0"
                    >
                      <td className="py-3 px-3 text-navy-900">
                        {formatDate(record.date)}
                      </td>

                      <td className="py-3 px-3">
                        {record.status === "present" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 px-2.5 py-1 text-xs font-medium">
                            <CheckCircle2 size={13} />
                            Present
                          </span>
                        )}

                        {record.status === "absent" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 text-red-700 px-2.5 py-1 text-xs font-medium">
                            <XCircle size={13} />
                            Absent
                          </span>
                        )}

                        {record.status === "leave" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 text-yellow-700 px-2.5 py-1 text-xs font-medium">
                            <Clock3 size={13} />
                            Leave
                          </span>
                        )}

                        {![
                          "present",
                          "absent",
                          "leave",
                        ].includes(record.status) && (
                          <span className="text-xs text-navy-900/60">
                            {record.status || "Unknown"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* -------------------------------- */}
        {/* Current class summary */}
        {/* -------------------------------- */}

        <div className="rounded-xl bg-navy-900/5 border border-[#eef0f4] p-5">
          <div className="text-xs text-navy-900/50">
            Current Class
          </div>

          <div className="font-semibold text-navy-900 mt-1">
            {className}
          </div>

          {classDetails && (
            <div className="text-xs text-navy-900/50 mt-1">
              {classDetails}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
