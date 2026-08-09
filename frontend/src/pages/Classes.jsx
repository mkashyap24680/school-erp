import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users2,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  course_name: "",
  course_code: "",
  department_name: "",
  department_code: "",
  year: "",
  semester: "",
  session: "",
  section: "",
  teacher_id: "",
};

function getNextYear(year) {
  if (!year) return "";

  const value = String(year).trim();

  const match = value.match(/^(\d+)(st|nd|rd|th)\s+Year$/i);

  if (match) {
    const number = Number(match[1]) + 1;

    const suffix =
      number === 1
        ? "st"
        : number === 2
        ? "nd"
        : number === 3
        ? "rd"
        : "th";

    return `${number}${suffix} Year`;
  }

  const numericMatch = value.match(/^(\d+)$/);

  if (numericMatch) {
    return String(Number(numericMatch[1]) + 1);
  }

  return value;
}

function getNextSemester(semester) {
  if (!semester) return "";

  const value = String(semester).trim();

  const match = value.match(/^(?:Sem\s*)?(\d+)(?:st|nd|rd|th)?(?:\s*Semester)?$/i);

  if (match) {
    return `Sem ${Number(match[1]) + 1}`;
  }

  const semesterMatch = value.match(/^(\d+)(?:st|nd|rd|th)\s+Semester$/i);

  if (semesterMatch) {
    const number = Number(semesterMatch[1]) + 1;

    const suffix =
      number === 1
        ? "st"
        : number === 2
        ? "nd"
        : number === 3
        ? "rd"
        : "th";

    return `${number}${suffix} Semester`;
  }

  return value;
}

function getNextSession(session) {
  if (!session) return "";

  const value = String(session).trim();

  const match = value.match(/^(\d{4})\s*[-/]\s*(\d{2}|\d{4})$/);

  if (!match) return value;

  const startYear = Number(match[1]);
  const nextStart = startYear + 1;

  const secondPart = match[2];

  if (secondPart.length === 2) {
    return `${nextStart}-${String(nextStart + 1).slice(-2)}`;
  }

  return `${nextStart}-${nextStart + 1}`;
}

export default function Classes() {
  const { user } = useAuth();

  const canEdit = ["admin", "management"].includes(user?.role);
  const canDelete = user?.role === "admin";

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [nextClassModalOpen, setNextClassModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [sourceClass, setSourceClass] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ---------------------------------------
  // Load classes + teachers
  // ---------------------------------------

  const load = async () => {
    setLoading(true);

    try {
      const [classRes, teacherRes] = await Promise.all([
        api.get("/classes"),
        api.get("/teachers").catch(() => ({ data: [] })),
      ]);

      setClasses(classRes.data || []);
      setTeachers(teacherRes.data || []);
    } catch (err) {
      console.error("Failed to load classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ---------------------------------------
  // Add class
  // ---------------------------------------

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
  };

  // ---------------------------------------
  // Edit class
  // ---------------------------------------

  const openEdit = (c) => {
    setEditingId(c.id);

    setForm({
      course_name: c.course_name || "",
      course_code: c.course_code || "",
      department_name: c.department_name || "",
      department_code: c.department_code || "",
      year: c.year || "",
      semester: c.semester || "",
      session: c.session || "",
      section: c.section || "",
      teacher_id: c.teacher_id || "",
    });

    setError("");
    setModalOpen(true);
  };

  // ---------------------------------------
  // Create next academic class
  // ---------------------------------------

  const openNextClass = (c) => {
    setSourceClass(c);

    setForm({
      course_name: c.course_name || "",
      course_code: c.course_code || "",
      department_name: c.department_name || "",
      department_code: c.department_code || "",
      year: getNextYear(c.year),
      semester: getNextSemester(c.semester),
      session: getNextSession(c.session),
      section: c.section || "",
      teacher_id: "",
    });

    setError("");
    setNextClassModalOpen(true);
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
  // Save class
  // ---------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        course_name: form.course_name,
        course_code: form.course_code || null,
        department_name: form.department_name,
        department_code: form.department_code || null,
        year: form.year || null,
        semester: form.semester || null,
        session: form.session || null,
        section: form.section || null,
        teacher_id: form.teacher_id || null,
      };

      if (editingId) {
        await api.put(`/classes/${editingId}`, payload);
      } else {
        await api.post("/classes", payload);
      }

      setModalOpen(false);
      setEditingId(null);
      setForm({ ...emptyForm });

      await load();
    } catch (err) {
      console.error("save class:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save class."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Save next class
  // ---------------------------------------

  const handleCreateNextClass = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        course_name: form.course_name,
        course_code: form.course_code || null,
        department_name: form.department_name,
        department_code: form.department_code || null,
        year: form.year || null,
        semester: form.semester || null,
        session: form.session || null,
        section: form.section || null,
        teacher_id: form.teacher_id || null,
      };

      await api.post("/classes", payload);

      setNextClassModalOpen(false);
      setSourceClass(null);
      setForm({ ...emptyForm });

      await load();
    } catch (err) {
      console.error("create next class:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create next academic class."
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------
  // Delete class
  // ---------------------------------------

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this class? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/classes/${id}`);
      await load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete class."
      );
    }
  };

  return (
    <DashboardLayout title="Classes">
      <div className="space-y-5">

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy-900">
              Classes
            </h2>

            <p className="text-sm text-navy-900/50 mt-0.5">
              Manage academic classes, sections and sessions.
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={openCreate}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Class
            </button>
          )}
        </div>

        {/* -------------------------------- */}
        {/* Class list */}
        {/* -------------------------------- */}

        {loading ? (
          <div className="card p-8 text-center text-navy-900/40 text-sm">
            Loading classes...
          </div>
        ) : classes.length === 0 ? (
          <div className="card p-8 text-center">
            <GraduationCap
              size={32}
              className="mx-auto text-navy-900/30 mb-2"
            />

            <p className="font-medium text-navy-900">
              No classes created yet.
            </p>

            {canEdit && (
              <p className="text-sm text-navy-900/50 mt-1">
                Click "Add Class" to create your first class.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

            {classes.map((c) => (
              <div
                key={c.id}
                className="card card-hover p-4"
              >

                {/* Card header */}

                <div className="flex items-start justify-between gap-2">

                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-900 text-base truncate">
                      {c.course_name}
                    </h3>

                    <p className="text-xs text-navy-900/50 mt-0.5">
                      {c.course_code || "Course"}
                    </p>
                  </div>

                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-1 shrink-0">

                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          title="Edit class"
                          className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          title="Delete class"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}

                    </div>
                  )}

                </div>

                {/* Department */}

                <p className="text-xs text-navy-900/70 mt-2 truncate">
                  {c.department_name || "Department"}

                  {c.department_code &&
                    ` (${c.department_code})`}
                </p>

                {/* Academic information */}

                <div className="flex flex-wrap gap-1.5 mt-3">

                  {c.year && (
                    <span className="badge badge-gray text-[10px]">
                      {c.year}
                    </span>
                  )}

                  {c.semester && (
                    <span className="badge badge-gray text-[10px]">
                      {c.semester}
                    </span>
                  )}

                  {c.section && (
                    <span className="badge badge-gray text-[10px]">
                      Sec {c.section}
                    </span>
                  )}

                  {c.session && (
                    <span className="badge badge-gray text-[10px]">
                      {c.session}
                    </span>
                  )}

                </div>

                {/* Students */}

                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-navy-900/5 text-xs text-navy-900/60">
                  <Users2 size={13} />

                  <span>
                    {c.studentCount ?? 0} students
                  </span>
                </div>

                {/* Next academic class */}

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => openNextClass(c)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-100"
                  >
                    <ArrowRight size={14} />

                    Create Next Class
                  </button>
                )}

              </div>
            ))}

          </div>
        )}

      </div>

      {/* ========================================= */}
      {/* ADD / EDIT CLASS MODAL */}
      {/* ========================================= */}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Class" : "Add Class"}
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

            {/* Course name */}

            <div>
              <label className="form-label">
                Course Name
              </label>

              <input
                name="course_name"
                required
                value={form.course_name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. B.tech"
              />
            </div>

            {/* Course code */}

            <div>
              <label className="form-label">
                Course Code
              </label>

              <input
                name="course_code"
                value={form.course_code}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. BT001"
              />
            </div>

            {/* Department */}

            <div>
              <label className="form-label">
                Department
              </label>

              <input
                name="department_name"
                required
                value={form.department_name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. CSE"
              />
            </div>

            {/* Department code */}

            <div>
              <label className="form-label">
                Department Code
              </label>

              <input
                name="department_code"
                value={form.department_code}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. CSE01"
              />
            </div>

            {/* Year */}

            <div>
              <label className="form-label">
                Year
              </label>

              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 1st Year"
              />
            </div>

            {/* Semester */}

            <div>
              <label className="form-label">
                Semester
              </label>

              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Sem 1"
              />
            </div>

            {/* Session */}

            <div>
              <label className="form-label">
                Session
              </label>

              <input
                name="session"
                value={form.session}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 2025-26"
              />
            </div>

            {/* Section */}

            <div>
              <label className="form-label">
                Section
              </label>

              <input
                name="section"
                value={form.section}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. A"
              />
            </div>

            {/* Teacher */}

            <div className="sm:col-span-2">
              <label className="form-label">
                Class Teacher
              </label>

              <select
                name="teacher_id"
                value={form.teacher_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">
                  No teacher assigned
                </option>

                {teachers.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.name}
                    {teacher.employee_id
                      ? ` (${teacher.employee_id})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Actions */}

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
                : editingId
                ? "Update Class"
                : "Create Class"}
            </button>

          </div>

        </form>
      </Modal>

      {/* ========================================= */}
      {/* CREATE NEXT CLASS MODAL */}
      {/* ========================================= */}

      <Modal
        open={nextClassModalOpen}
        onClose={() => setNextClassModalOpen(false)}
        title="Create Next Academic Class"
        wide
      >
        <form
          onSubmit={handleCreateNextClass}
          className="space-y-4"
        >

          {error && (
            <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Current class */}

          {sourceClass && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

              <div className="text-xs font-medium text-blue-600 mb-1">
                Current Class
              </div>

              <div className="font-semibold text-navy-900">
                {sourceClass.course_name}
                {sourceClass.department_name
                  ? ` — ${sourceClass.department_name}`
                  : ""}
              </div>

              <div className="text-xs text-navy-900/60 mt-1">
                {[
                  sourceClass.year,
                  sourceClass.semester,
                  sourceClass.session,
                  sourceClass.section
                    ? `Section ${sourceClass.section}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" — ")}
              </div>

            </div>
          )}

          <div className="rounded-xl border border-green-100 bg-green-50 p-4">

            <div className="text-xs font-medium text-green-700 mb-1">
              New Academic Class
            </div>

            <div className="text-sm text-green-800">
              Details have been automatically carried forward.
              You can change anything before creating.
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Course */}

            <div>
              <label className="form-label">
                Course Name
              </label>

              <input
                name="course_name"
                required
                value={form.course_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Course code */}

            <div>
              <label className="form-label">
                Course Code
              </label>

              <input
                name="course_code"
                value={form.course_code}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Department */}

            <div>
              <label className="form-label">
                Department
              </label>

              <input
                name="department_name"
                required
                value={form.department_name}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Department code */}

            <div>
              <label className="form-label">
                Department Code
              </label>

              <input
                name="department_code"
                value={form.department_code}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* New Year */}

            <div>
              <label className="form-label">
                New Year
              </label>

              <input
                name="year"
                value={form.year}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 2nd Year"
              />
            </div>

            {/* New Semester */}

            <div>
              <label className="form-label">
                New Semester
              </label>

              <input
                name="semester"
                value={form.semester}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Sem 3"
              />
            </div>

            {/* New Session */}

            <div>
              <label className="form-label">
                New Session
              </label>

              <input
                name="session"
                value={form.session}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. 2026-27"
              />
            </div>

            {/* Section */}

            <div>
              <label className="form-label">
                Section
              </label>

              <input
                name="section"
                value={form.section}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. A"
              />
            </div>

            {/* Teacher */}

            <div className="sm:col-span-2">
              <label className="form-label">
                New Class Teacher
              </label>

              <select
                name="teacher_id"
                value={form.teacher_id}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">
                  No teacher assigned
                </option>

                {teachers.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.name}
                    {teacher.employee_id
                      ? ` (${teacher.employee_id})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Info */}

          <div className="rounded-lg bg-yellow-50 border border-yellow-100 px-3 py-2 text-xs text-yellow-700">
            Creating this class will only create the new academic
            class. Students will not be moved automatically.
            Student promotion should be done from the Students page.
          </div>

          {/* Actions */}

          <div className="flex justify-end gap-3 pt-2">

            <button
              type="button"
              onClick={() => setNextClassModalOpen(false)}
              className="btn-outline"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary inline-flex items-center gap-2"
            >
              <GraduationCap size={16} />

              {saving
                ? "Creating..."
                : "Create Next Class"}
            </button>

          </div>

        </form>
      </Modal>

    </DashboardLayout>
  );
}
