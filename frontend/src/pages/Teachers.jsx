import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import Modal from "../components/Modal";
import BulkImportButton from "../components/BulkImportButton";
import IdCardButton from "../components/IdCardButton";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const emptyForm = {
  name: "",
  employee_id: "",
  email: "",
  phone: "",
  subject: "",
  department: "",
  course: "",
  designation: "",
  qualification: "",
  joining_date: "",
  experience: "",
  employment_type: "",
  campus: "",
  status: "active",
  address: "",
  emergency_contact_name: "",
  emergency_contact_number: "",

  // Login account
  login_email: "",
  password: "",
  confirm_password: "",
};

export default function Teachers() {
  const { user } = useAuth();

  const canEdit = ["admin", "management"].includes(user?.role);
  const canDelete = user?.role === "admin";

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // -----------------------------------------
  // Load teachers
  // -----------------------------------------

  const load = async () => {
    setLoading(true);

    try {
      const res = await api.get("/teachers");
      setTeachers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load teachers:", err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // -----------------------------------------
  // Filter options
  // -----------------------------------------

  const departments = useMemo(() => {
    return [
      ...new Set(
        teachers.map((t) => t.department).filter(Boolean)
      ),
    ].sort();
  }, [teachers]);

  const subjects = useMemo(() => {
    return [
      ...new Set(
        teachers.map((t) => t.subject).filter(Boolean)
      ),
    ].sort();
  }, [teachers]);

  const courses = useMemo(() => {
    return [
      ...new Set(
        teachers.map((t) => t.course).filter(Boolean)
      ),
    ].sort();
  }, [teachers]);

  // -----------------------------------------
  // Filters
  // -----------------------------------------

  const filteredTeachers = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const matchesSearch =
        !searchText ||
        teacher.name?.toLowerCase().includes(searchText) ||
        teacher.employee_id?.toLowerCase().includes(searchText) ||
        teacher.email?.toLowerCase().includes(searchText) ||
        teacher.phone?.toLowerCase().includes(searchText);

      const matchesDepartment =
        !departmentFilter ||
        teacher.department === departmentFilter;

      const matchesSubject =
        !subjectFilter ||
        teacher.subject === subjectFilter;

      const matchesCourse =
        !courseFilter ||
        teacher.course === courseFilter;

      const matchesStatus =
        !statusFilter ||
        teacher.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesSubject &&
        matchesCourse &&
        matchesStatus
      );
    });
  }, [
    teachers,
    search,
    departmentFilter,
    subjectFilter,
    courseFilter,
    statusFilter,
  ]);

  // -----------------------------------------
  // Create
  // -----------------------------------------

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError("");
    setModalOpen(true);
  };

  // -----------------------------------------
  // Edit
  // -----------------------------------------

  const openEdit = (teacher) => {
    setEditingId(teacher.id);

    setForm({
      name: teacher.name || "",
      employee_id: teacher.employee_id || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      subject: teacher.subject || "",
      department: teacher.department || "",
      course: teacher.course || "",
      designation: teacher.designation || "",
      qualification: teacher.qualification || "",
      joining_date: teacher.joining_date || "",
      experience: teacher.experience || "",
      employment_type: teacher.employment_type || "",
      campus: teacher.campus || "",
      status: teacher.status || "active",
      address: teacher.address || "",
      emergency_contact_name:
        teacher.emergency_contact_name || "",
      emergency_contact_number:
        teacher.emergency_contact_number || "",

      // Login account
      login_email: teacher.User?.email || teacher.user?.email || teacher.email || "",
      password: "",
      confirm_password: "",
    });

    setError("");
    setModalOpen(true);
  };

  // -----------------------------------------
  // Input change
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // Save
  // -----------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      // -----------------------------
      // Validation
      // -----------------------------

      if (!editingId) {
        if (!form.login_email.trim()) {
          setError("Login email is required.");
          setSaving(false);
          return;
        }

        if (!form.password) {
          setError("Password is required for a new teacher.");
          setSaving(false);
          return;
        }

        if (form.password.length < 6) {
          setError("Password must be at least 6 characters.");
          setSaving(false);
          return;
        }

        if (form.password !== form.confirm_password) {
          setError("Password and confirm password do not match.");
          setSaving(false);
          return;
        }
      }

      if (
        editingId &&
        form.password &&
        form.password !== form.confirm_password
      ) {
        setError("Password and confirm password do not match.");
        setSaving(false);
        return;
      }

      // -----------------------------
      // Teacher payload
      // -----------------------------

      const payload = {
        name: form.name.trim(),
        employee_id: form.employee_id.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        department: form.department.trim(),
        course: form.course.trim(),
        designation: form.designation.trim(),
        qualification: form.qualification.trim(),
        joining_date: form.joining_date || null,
        experience: form.experience.trim(),
        employment_type: form.employment_type.trim(),
        campus: form.campus.trim(),
        status: form.status,
        address: form.address.trim(),
        emergency_contact_name:
          form.emergency_contact_name.trim(),
        emergency_contact_number:
          form.emergency_contact_number.trim(),

        // Login account data
        login_email: form.login_email.trim(),
      };

      // Only send password when creating
      // or when user entered a new password while editing.
      if (form.password) {
        payload.password = form.password;
      }

      // -----------------------------
      // Create / Update
      // -----------------------------

      if (editingId) {
        await api.put(`/teachers/${editingId}`, payload);
      } else {
        await api.post("/teachers", payload);
      }

      setModalOpen(false);
      setForm({ ...emptyForm });
      setEditingId(null);

      await load();
    } catch (err) {
      console.error("Save teacher error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to save teacher."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Delete
  // -----------------------------------------

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this teacher record? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/teachers/${id}`);
      await load();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to delete teacher."
      );
    }
  };

  // -----------------------------------------
  // Clear filters
  // -----------------------------------------

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("");
    setSubjectFilter("");
    setCourseFilter("");
    setStatusFilter("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">
              Teachers
            </h1>

            <p className="text-sm text-navy-900/50 mt-1">
              Manage teachers, departments, subjects and employment details.
            </p>
          </div>

          <div className="flex gap-2">
            {canEdit && (
              <BulkImportButton
                endpoint="/teachers/bulk"
                payloadKey="teachers"
                expectedColumns={[
                  { key: "name", label: "name" },
                  { key: "employee_id", label: "employee_id" },
                  { key: "email", label: "email" },
                  { key: "phone", label: "phone" },
                  { key: "subject", label: "subject" },
                  { key: "department", label: "department" },
                  { key: "course", label: "course" },
                  { key: "designation", label: "designation" },
                  { key: "qualification", label: "qualification" },
                  { key: "joining_date", label: "joining_date" },
                  { key: "experience", label: "experience" },
                  { key: "employment_type", label: "employment_type" },
                  { key: "campus", label: "campus" },
                  { key: "status", label: "status" },
                ]}
                onDone={load}
              />
            )}

            {canEdit && (
              <button
                onClick={openCreate}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={17} />
                Add Teacher
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search size={17} className="text-navy-900/50" />

            <h2 className="font-semibold text-navy-900">
              Quick Filters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

            <input
              type="text"
              placeholder="Search Teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
            />

            <select
              value={departmentFilter}
              onChange={(e) =>
                setDepartmentFilter(e.target.value)
              }
              className="form-input"
            >
              <option value="">All Departments</option>

              {departments.map((department) => (
                <option
                  key={department}
                  value={department}
                >
                  {department}
                </option>
              ))}
            </select>

            <select
              value={subjectFilter}
              onChange={(e) =>
                setSubjectFilter(e.target.value)
              }
              className="form-input"
            >
              <option value="">All Subjects</option>

              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value)
              }
              className="form-input"
            >
              <option value="">All Courses</option>

              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(search ||
            departmentFilter ||
            subjectFilter ||
            courseFilter ||
            statusFilter) && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 mt-3 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="text-sm text-navy-900/50">
          Showing{" "}
          <span className="font-semibold text-navy-900">
            {filteredTeachers.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-navy-900">
            {teachers.length}
          </span>{" "}
          teachers
        </div>

        {/* Table */}
        {loading ? (
          <div className="card text-center py-10 text-navy-900/40">
            Loading teachers...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="card text-center py-10 text-navy-900/40">
            No teachers found.
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 text-left">
                  <th className="px-4 py-4 font-semibold">Profile</th>
                  <th className="px-4 py-4 font-semibold">Employee ID</th>
                  <th className="px-4 py-4 font-semibold">Department</th>
                  <th className="px-4 py-4 font-semibold">Designation</th>
                  <th className="px-4 py-4 font-semibold">Experience</th>
                  <th className="px-4 py-4 font-semibold">Employment</th>
                  <th className="px-4 py-4 font-semibold">Campus</th>
                  <th className="px-4 py-4 font-semibold">Contact</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Joining Date</th>
                  <th className="px-4 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="border-b border-navy-900/5 hover:bg-[#f8f9fb]"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-navy-900">
                        {teacher.name || "—"}
                      </div>

                      <div className="text-xs text-navy-900/50 mt-1">
                        {teacher.subject || "No subject"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {teacher.employee_id || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {teacher.department || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {teacher.designation || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {teacher.experience || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {teacher.employment_type || "—"}
                    </td>

                    <td className="px-4 py-4">
                      {teacher.campus || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <div>
                        {teacher.phone || "—"}
                      </div>

                      <div className="text-xs text-navy-900/50 mt-1">
                        {teacher.email || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {teacher.status === "inactive" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {teacher.joining_date || "—"}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">

                        <IdCardButton
                          person={teacher}
                          type="Teacher"
                        />

                        {canEdit && (
                          <button
                            onClick={() => openEdit(teacher)}
                            className="p-1.5 rounded-lg hover:bg-[#f0f2f5] text-navy-900/60"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() =>
                              handleDelete(teacher.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add / Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingId ? "Edit Teacher" : "Add Teacher"}
          wide
        >
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <div className="text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {/* ========================= */}
            {/* LOGIN ACCOUNT */}
            {/* ========================= */}

            <div className="rounded-xl border border-navy-900/10 p-4 bg-gray-50">
              <h3 className="font-semibold text-navy-900 mb-1">
                Login Account
              </h3>

              <p className="text-xs text-navy-900/50 mb-4">
                {editingId
                  ? "Leave password blank if you do not want to change it."
                  : "Create login credentials for this teacher."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Login Email */}
                <div>
                  <label className="form-label">
                    Login Email
                  </label>

                  <input
                    type="email"
                    name="login_email"
                    value={form.login_email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="teacher@example.com"
                    required={!editingId}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="form-label">
                    {editingId
                      ? "New Password (optional)"
                      : "Password"}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder={
                      editingId
                        ? "Leave blank to keep current"
                        : "Minimum 6 characters"
                    }
                    required={!editingId}
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="form-label">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Re-enter password"
                    required={!editingId && !!form.password}
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="form-label">
                    Account Role
                  </label>

                  <input
                    value="Teacher"
                    disabled
                    className="form-input bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* ========================= */}
            {/* PERSONAL INFORMATION */}
            {/* ========================= */}

            <div>
              <h3 className="font-semibold text-navy-900 mb-3">
                Personal Information
              </h3>

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
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Employee ID
                  </label>

                  <input
                    name="employee_id"
                    value={form.employee_id}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. EMP-1025"
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
                    placeholder="teacher@example.com"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="9876543210"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Emergency Contact Name
                  </label>

                  <input
                    name="emergency_contact_name"
                    value={form.emergency_contact_name}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Emergency Contact Number
                  </label>

                  <input
                    name="emergency_contact_number"
                    value={form.emergency_contact_number}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="form-label">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="form-input min-h-[80px]"
                    placeholder="Full residential address"
                  />
                </div>
              </div>
            </div>

            {/* ========================= */}
            {/* PROFESSIONAL INFORMATION */}
            {/* ========================= */}

            <div>
              <h3 className="font-semibold text-navy-900 mb-3">
                Professional Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="form-label">
                    Department
                  </label>

                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Subject
                  </label>

                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Data Structures"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Course
                  </label>

                  <input
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. B.Tech"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Designation
                  </label>

                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Assistant Professor"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Qualification
                  </label>

                  <input
                    name="qualification"
                    value={form.qualification}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. M.Tech, PhD"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Experience
                  </label>

                  <input
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. 6 Years"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Joining date
                  </label>

                  <input
                    type="date"
                    name="joining_date"
                    value={form.joining_date}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Employment Type
                  </label>

                  <select
                    name="employment_type"
                    value={form.employment_type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">
                      Select employment type
                    </option>
                    <option value="Permanent">
                      Permanent
                    </option>
                    <option value="Contract">
                      Contract
                    </option>
                    <option value="Part Time">
                      Part Time
                    </option>
                    <option value="Visiting">
                      Visiting
                    </option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Campus / Branch
                  </label>

                  <input
                    name="campus"
                    value={form.campus}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Main Campus"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Buttons */}
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
                  ? "Update Teacher"
                  : "Create Teacher & Login"}
              </button>

            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
