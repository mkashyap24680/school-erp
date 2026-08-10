import { useEffect, useState } from "react";
import { CalendarCheck, Save } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["present", "absent", "leave"];

export default function Attendance() {
  const { user } = useAuth();

  if (user?.role === "student") {
    return <StudentAttendance />;
  }

  return <StaffAttendance />;
}

// --------------------------------------------------
// STUDENT ATTENDANCE
// --------------------------------------------------

function StudentAttendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/attendance/me")
      .then((res) => setRecords(res.data || []))
      .catch((err) => {
        console.error("Attendance loading error:", err);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const presentCount = records.filter(
    (r) => r.status === "present"
  ).length;

  const percent = records.length
    ? Math.round((presentCount / records.length) * 100)
    : 0;

  return (
    <DashboardLayout title="My Attendance">
      <div className="space-y-6">

        {/* Attendance Summary */}
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center">
              <CalendarCheck size={21} />
            </div>

            <div>
              <div className="text-2xl font-bold text-navy-900">
                {percent}%
              </div>

              <p className="text-sm text-navy-900/50">
                Overall attendance ({records.length} days recorded)
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="card p-4 sm:p-5 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-8 text-navy-900/40"
                  >
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && records.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-8 text-navy-900/40"
                  >
                    No attendance records yet.
                  </td>
                </tr>
              )}

              {!loading &&
                records.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>

                    <td>
                      <StatusBadge status={r.status} />
                    </td>

                    <td>
                      {r.teacher_name ||
                        r.marked_by_name ||
                        r.teacher?.name ||
                        r.marked_by?.name ||
                        "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --------------------------------------------------
// STAFF ATTENDANCE
// --------------------------------------------------

function StaffAttendance() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // LOAD CLASSES
  // --------------------------------------------------

  useEffect(() => {
    api
      .get("/classes")
      .then((res) => {
        const data = res.data || [];

        setClasses(data);

        if (data.length) {
          setClassId(String(data[0].id));
        }
      })
      .catch((err) => {
        console.error("Classes loading error:", err);
      });
  }, []);

  // --------------------------------------------------
  // LOAD STUDENTS + ATTENDANCE
  // --------------------------------------------------

  useEffect(() => {
    if (!classId) return;

    setLoading(true);
    setMessage("");

    Promise.all([
      api.get("/students"),
      api.get("/attendance", {
        params: {
          class_id: classId,
          date,
        },
      }),
    ])
      .then(([studentsRes, attendanceRes]) => {
        const allStudents = studentsRes.data || [];
        const attendanceData = attendanceRes.data || [];

        const classStudents = allStudents.filter(
          (student) =>
            String(student.class_id) === String(classId)
        );

        setStudents(classStudents);
        setAttendanceRecords(attendanceData);

        const map = {};

        classStudents.forEach((student) => {
          map[student.id] = "present";
        });

        attendanceData.forEach((attendance) => {
          map[attendance.student_id] =
            attendance.status;
        });

        setStatusMap(map);
      })
      .catch((err) => {
        console.error("Attendance loading error:", err);

        setStudents([]);
        setAttendanceRecords([]);
        setStatusMap({});
      })
      .finally(() => {
        setLoading(false);
      });
  }, [classId, date]);

  // --------------------------------------------------
  // CHANGE STATUS
  // --------------------------------------------------

  const setStatus = (studentId, status) => {
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // --------------------------------------------------
  // SAVE ATTENDANCE
  // --------------------------------------------------

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const records = students.map((student) => ({
        student_id: student.id,
        status: statusMap[student.id] || "present",
      }));

      await api.post("/attendance/bulk", {
        class_id: classId,
        date,
        records,
      });

      setMessage("Attendance saved successfully.");

      // Reload attendance so Marked By also updates
      const res = await api.get("/attendance", {
        params: {
          class_id: classId,
          date,
        },
      });

      setAttendanceRecords(res.data || []);
    } catch (err) {
      setMessage(
        err.response?.data?.message ||
          "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // FIND TEACHER NAME
  // --------------------------------------------------

  const getTeacherName = (studentId) => {
    const record = attendanceRecords.find(
      (attendance) =>
        String(attendance.student_id) ===
        String(studentId)
    );

    if (!record) return "—";

    return (
      record.teacher_name ||
      record.marked_by_name ||
      record.teacher?.name ||
      record.marked_by?.name ||
      record.user_name ||
      record.user?.name ||
      "—"
    );
  };

  return (
    <DashboardLayout title="Attendance">
      <div className="space-y-5">

        {/* Controls */}
        <div className="card p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Class */}
            <div>
              <label className="form-label">
                Class
              </label>

              <select
                value={classId}
                onChange={(e) =>
                  setClassId(e.target.value)
                }
                className="form-input"
              >
                {classes.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                    {c.section
                      ? ` - ${c.section}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="form-label">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                className="form-input"
              />
            </div>

            {/* Save */}
            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={
                  saving || !students.length
                }
                className="btn-primary w-full justify-center"
              >
                <Save size={16} />

                {saving
                  ? "Saving..."
                  : "Save Attendance"}
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="text-sm bg-brand-100 text-brand-600 border border-brand-100 rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        {/* Attendance Table */}
        <div className="card p-4 sm:p-5 overflow-x-auto">
          <table className="data-table">

            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-navy-900/40"
                  >
                    Loading...
                  </td>
                </tr>
              )}

              {!loading &&
                students.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-8 text-navy-900/40"
                    >
                      No students in this class.
                    </td>
                  </tr>
                )}

              {!loading &&
                students.map((student) => (
                  <tr key={student.id}>

                    {/* Student */}
                    <td className="font-medium">
                      {student.name}
                    </td>

                    {/* Roll No */}
                    <td>
                      {student.roll_no || "—"}
                    </td>

                    {/* Status */}
                    <td>
                      <div className="flex gap-1.5">

                        {STATUS_OPTIONS.map(
                          (option) => (
                            <button
                              key={option}
                              onClick={() =>
                                setStatus(
                                  student.id,
                                  option
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize border ${
                                statusMap[
                                  student.id
                                ] === option
                                  ? option ===
                                    "present"
                                    ? "bg-brand-500 text-white border-brand-500"
                                    : option ===
                                      "absent"
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-orange-400 text-white border-orange-400"
                                  : "bg-white text-navy-900/60 border-[#e2e5ea]"
                              }`}
                            >
                              {option}
                            </button>
                          )
                        )}

                      </div>
                    </td>

                    {/* Marked By */}
                    <td>
                      <span className="font-medium text-navy-900">
                        {getTeacherName(student.id)}
                      </span>
                    </td>

                  </tr>
                ))}

            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

// --------------------------------------------------
// STATUS BADGE
// --------------------------------------------------

function StatusBadge({ status }) {
  const cls =
    status === "present"
      ? "badge-green"
      : status === "absent"
      ? "badge-red"
      : "badge-orange";

  return (
    <span className={`badge ${cls} capitalize`}>
      {status}
    </span>
  );
}
