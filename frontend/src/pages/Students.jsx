import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import DataTable from "../components/DataTable";
import IdCardButton from "../components/IdCardButton";
import MarksheetButton from "../components/MarksheetButton";
import BulkImportButton from "../components/BulkImportButton";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  email: "",
  roll_no: "",
  admission_no: "",
  class_id: "",
  dob: "",
  gender: "male",
  parent_name: "",
  parent_phone: "",
  address: "",
  guardian_user_id: "",
};

export default function Students() {
  const { user } = useAuth();

  const canEdit = ["admin", "management"].includes(user?.role);
  const canDelete = user?.role === "admin";

  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [parents, setParents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------
  // Student filters
  // ---------------------------------------
  const [filters, setFilters] = useState({
    course: "",
    department: "",
    year: "",
    semester: "",
    session: "",
    section: "",
  });

  const load = () => {
    setLoading(true);

    const calls = [
      api.get("/students"),
      api.get("/classes"),
    ];

    if (user?.role === "admin") {
      calls.push(api.get("/users"));
    }

    Promise.all(calls)
      .then(([sRes, cRes, uRes]) => {
        setStudents(sRes.data);
        setClasses(cRes.data);

        if (uRes) {
          setParents(
            uRes.data.filter((u) => u.role === "parent")
          );
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [user?.role]);

  // ---------------------------------------
  // Create student
  // ---------------------------------------
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  };

  // ---------------------------------------
  // Edit student
  // ---------------------------------------
  const openEdit = (s) => {
    setEditingId(s.id);

    setForm({
      name: s.name || "",
      email: s.email || "",
      roll_no: s.roll_no || "",
      admission_no: s.admission_no || "",
      class_id: s.class_id || "",
      dob: s.dob || "",
      gender: s.gender || "male",
      parent_name: s.parent_name || "",
      parent_phone: s.parent_phone || "",
      address: s.address || "",
      guardian_user_id: s.guardian_user_id || "",
    });

    setError("");
    setModalOpen(true);
  };

  // ---------------------------------------
  // Form change
  // ---------------------------------------
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------------------------------
  // Save student
  // ---------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form,
        class_id: form.class_id || null,
        guardian_user_id: form.guardian_user_id || null,
      };

      if (editingId) {
        await api.put(`/students/${editingId}`, payload);
      } else {
        await api.post("/students", payload);
      }

      setModalOpen(false);
      load();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to save student."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Delete student
  // ---------------------------------------
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this student record? This cannot be undone."
      )
    ) {
      return;
    }

    await api.delete(`/students/${id}`);
    load();
  };

  // ---------------------------------------
  // Filter change
  // ---------------------------------------
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------------------------------
  // Reset filters
  // ---------------------------------------
  const resetFilters = () => {
    setFilters({
      course: "",
      department: "",
      year: "",
      semester: "",
      session: "",
      section: "",
    });
  };

  // ---------------------------------------
  // Unique filter options
  // ---------------------------------------

  const courseOptions = useMemo(() => {
    return [...new Set(
      classes
        .map((c) => c.course_name)
        .filter(Boolean)
    )].sort();
  }, [classes]);

  const departmentOptions = useMemo(() => {
    return [...new Set(
      classes
        .filter((c) =>
          !filters.course ||
          c.course_name === filters.course
        )
        .map((c) => c.department_name)
        .filter(Boolean)
    )].sort();
  }, [classes, filters.course]);

  const yearOptions = useMemo(() => {
    return [...new Set(
      classes
        .filter((c) =>
          !filters.course ||
          c.course_name === filters.course
        )
        .filter((c) =>
          !filters.department ||
          c.department_name === filters.department
        )
        .map((c) => c.year)
        .filter(Boolean)
    )].sort();
  }, [classes, filters.course, filters.department]);

  const semesterOptions = useMemo(() => {
    return [...new Set(
      classes
        .filter((c) =>
          !filters.course ||
          c.course_name === filters.course
        )
        .filter((c) =>
          !filters.department ||
          c.department_name === filters.department
        )
        .filter((c) =>
          !filters.year ||
          c.year === filters.year
        )
        .map((c) => c.semester)
        .filter(Boolean)
    )].sort();
  }, [
    classes,
    filters.course,
    filters.department,
    filters.year,
  ]);

  const sessionOptions = useMemo(() => {
    return [...new Set(
      classes
        .filter((c) =>
          !filters.course ||
          c.course_name === filters.course
        )
        .filter((c) =>
          !filters.department ||
          c.department_name === filters.department
        )
        .filter((c) =>
          !filters.year ||
          c.year === filters.year
        )
        .filter((c) =>
          !filters.semester ||
          c.semester === filters.semester
        )
        .map((c) => c.session)
        .filter(Boolean)
    )].sort().reverse();
  }, [
    classes,
    filters.course,
    filters.department,
    filters.year,
    filters.semester,
  ]);

  const sectionOptions = useMemo(() => {
    return [...new Set(
      classes
        .filter((c) =>
          !filters.course ||
          c.course_name === filters.course
        )
        .filter((c) =>
          !filters.department ||
          c.department_name === filters.department
        )
        .filter((c) =>
          !filters.year ||
          c.year === filters.year
        )
        .filter((c) =>
          !filters.semester ||
          c.semester === filters.semester
        )
        .filter((c) =>
          !filters.session ||
          c.session === filters.session
        )
        .map((c) => c.section)
        .filter(Boolean)
    )].sort();
  }, [
    classes,
    filters.course,
    filters.department,
    filters.year,
    filters.semester,
    filters.session,
  ]);

  // ---------------------------------------
  // Filter students
  // ---------------------------------------
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const c = student.SchoolClass;

      if (!c) {
        return (
          !filters.course &&
          !filters.department &&
          !filters.year &&
          !filters.semester &&
          !filters.session &&
          !filters.section
        );
      }

      if (
        filters.course &&
        c.course_name !== filters.course
      ) {
        return false;
      }

      if (
        filters.department &&
        c.department_name !== filters.department
      ) {
        return false;
      }

      if (
        filters.year &&
        c.year !== filters.year
      ) {
        return false;
      }

      if (
        filters.semester &&
        c.semester !== filters.semester
      ) {
        return false;
      }

      if (
        filters.session &&
        c.session !== filters.session
      ) {
        return false;
      }

      if (
        filters.section &&
        c.section !== filters.section
      ) {
        return false;
      }

      return true;
    });
  }, [students, filters]);

  // ---------------------------------------
  // Student table columns
  // ---------------------------------------
  const columns = [
    {
      key: "name",
      label: "Name",
      render: (s) => (
        <span className="font-medium">
          {s.name}
        </span>
      ),
    },

    {
      key: "roll_no",
      label: "Roll No",
    },

    {
      key: "admission_no",
      label: "Admission No",
    },

    {
      key: "class",
      label: "Class",

      exportValue: (s) => {
        if (!s.SchoolClass) return "—";

        const c = s.SchoolClass;

        return [
          c.course_name,
          c.department_name,
          c.year,
          c.semester,
          c.session,
          c.section
            ? `Section ${c.section}`
            : null,
        ]
          .filter(Boolean)
          .join(" — ");
      },

      render: (s) => {
        if (!s.SchoolClass) return "—";

        const c = s.SchoolClass;

        return (
          <div className="leading-5">
            <div className="font-medium">
              {c.course_name}
              {c.department_name
                ? ` — ${c.department_name}`
                : ""}
            </div>

            <div className="text-xs text-navy-900/50">
              {[
                c.year,
                c.semester,
                c.session,
                c.section
                  ? `Section ${c.section}`
                  : null,
              ]
                .filter(Boolean)
                .join(" — ")}
            </div>
          </div>
        );
      },

      sortValue: (s) =>
        s.SchoolClass
          ? [
              s.SchoolClass.course_name,
              s.SchoolClass.department_name,
              s.SchoolClass.year,
              s.SchoolClass.semester,
              s.SchoolClass.session,
              s.SchoolClass.section,
            ]
              .filter(Boolean)
              .join(" ")
          : "",
    },

    {
      key: "parent_phone",
      label: "Parent Contact",
    },
  ];

  return (
    <DashboardLayout title="Students">

      <div className="card p-4 sm:p-5">

        {/* -------------------------------- */}
        {/* Top actions */}
        {/* -------------------------------- */}

        <div className="flex justify-end mb-4 gap-2">

          {canEdit && (
            <BulkImportButton
              endpoint="/students/bulk"
              payloadKey="students"
              expectedColumns={[
                { key: "name", label: "name" },
                { key: "email", label: "email" },
                { key: "roll_no", label: "roll_no" },
                { key: "admission_no", label: "admission_no" },
              ]}
              onDone={load}
            />
          )}

          {canEdit && (
            <button
              onClick={openCreate}
              className="btn-primary"
            >
              <Plus size={16} />
              Add Student
            </button>
          )}

        </div>

        {/* -------------------------------- */}
        {/* Filters */}
        {/* -------------------------------- */}

        <div className="border border-[#eef0f4] rounded-xl p-4 mb-5">

          <div className="flex items-center justify-between mb-3">

            <div>
              <h3 className="font-semibold text-navy-900">
                Student Filters
              </h3>

              <p className="text-xs text-navy-900/50 mt-0.5">
                Filter students by course, department,
                year, semester, session and section.
              </p>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="btn-outline text-sm flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              Reset
            </button>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">

            {/* Course */}

            <div>
              <label className="form-label">
                Course
              </label>

              <select
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">
                  All Courses
                </option>

                {courseOptions.map((course) => (
                  <option
                    key={course}
                    value={course}
                  >
                    {course}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}

            <div>
              <label className="form-label">
                Department
              </label>

              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">
                  All Departments
                </option>

                {departmentOptions.map(
                  (department) => (
                    <option
                      key={department}
                      value={department}
                    >
                      {department}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Year */}

            <div>
              <label className="form-label">
                Year
              </label>

              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">
                  All Years
                </option>

                {yearOptions.map((year) => (
                  <option
                    key={year}
                    value={year}
                  >
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Semester */}

            <div>
              <label className="form-label">
                Semester
              </label>

              <select
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">
                  All Semesters
                </option>

                {semesterOptions.map(
                  (semester) => (
                    <option
                      key={semester}
                      value={semester}
                    >
                      {semester}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Session */}

            <div>
              <label className="form-label">
                Session
              </label>

              <select
                name="session"
                value={filters.session}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">
                  All Sessions
                </option>

                {sessionOptions.map((session) => (
                  <option
                    key={session}
                    value={session}
                  >
                    {session}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}

            <div>
              <label className="form-label">
                Section
              </label>

              <select
                name="section"
                value={filters.section}
                onChange={handleFilterChange}
                className="form-input"
              >
                <option value="">
                  All Sections
                </option>

                {sectionOptions.map((section) => (
                  <option
                    key={section}
                    value={section}
                  >
                    Section {section}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Filter result count */}

          <div className="mt-3 text-xs text-navy-900/50">
            Showing{" "}
            <span className="font-semibold text-navy-900">
              {filteredStudents.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-navy-900">
              {students.length}
            </span>{" "}
            students
          </div>

        </div>

        {/* -------------------------------- */}
        {/* Student table */}
        {/* -------------------------------- */}

        {loading ? (
          <div className="text-center py-8 text-navy-900/40 text-sm">
            Loading...
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredStudents}
            searchPlaceholder="Search students..."
            exportFileName="students"
            actionsColumn={(s) => (
              <div className="flex gap-1">

                <IdCardButton
                  person={s}
                  type="Student"
                />

                <MarksheetButton
                  studentId={s.id}
                  studentName={s.name}
                  className={
                    s.SchoolClass
                      ? `${s.SchoolClass.course_name || ""}${s.SchoolClass.section || ""}`
                      : ""
                  }
                  fetchUrl={`/exams/results/student/${s.id}`}
                />

                {canEdit && (
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60"
                  >
                    <Pencil size={15} />
                  </button>
                )}

                {canDelete && (
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                )}

              </div>
            )}
          />
        )}

      </div>

      {/* -------------------------------- */}
      {/* Add / Edit Student Modal */}
      {/* -------------------------------- */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId
            ? "Edit Student"
            : "Add Student"
        }
        wide
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {error && (
            <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="form-label">
                Full name
              </label>

              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Roll No
              </label>

              <input
                name="roll_no"
                value={form.roll_no}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Admission No
              </label>

              <input
                name="admission_no"
                value={form.admission_no}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Complete Class */}

            <div className="sm:col-span-2">
              <label className="form-label">
                Class
              </label>

              <select
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">
                  Unassigned
                </option>

                {classes.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {[
                      c.course_name,
                      c.department_name,
                      c.year,
                      c.semester,
                      c.session,
                      c.section
                        ? `Section ${c.section}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" — ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">
                Date of birth
              </label>

              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Gender
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Parent name
              </label>

              <input
                name="parent_name"
                value={form.parent_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Parent phone
              </label>

              <input
                name="parent_phone"
                value={form.parent_phone}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {user?.role === "admin" && (
              <div>
                <label className="form-label">
                  Linked Parent Portal account
                </label>

                <select
                  name="guardian_user_id"
                  value={form.guardian_user_id}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">
                    Not linked
                  </option>

                  {parents.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="form-label">
                Address
              </label>

              <textarea
                name="address"
                rows={2}
                value={form.address}
                onChange={handleChange}
                className="form-input"
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving
                ? "Saving..."
                : "Save Student"}
            </button>

          </div>

        </form>

      </Modal>

    </DashboardLayout>
  );
}
