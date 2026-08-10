import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Filter,
  Clock3,
  UserRound,
  BookOpen,
  DoorOpen,
  AlertCircle,
  X,
} from "lucide-react";

import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const emptyForm = {
  class_id: "",
  subject: "",
  teacher_id: "",
  day: "Monday",
  start_time: "09:00",
  end_time: "10:00",
  room: "",
};

export default function Timetable() {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const [classFilter, setClassFilter] = useState("all");
  const [teacherFilter, setTeacherFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canManage = ["admin", "management"].includes(user?.role);

  // --------------------------------------------------
  // LOAD DATA
  // --------------------------------------------------

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [classesRes, teachersRes, timetableRes] =
        await Promise.all([
          api.get("/classes"),
          api.get("/teachers"),
          api.get("/timetable"),
        ]);

      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
      setSlots(timetableRes.data || []);
    } catch (err) {
      console.error("Timetable loading error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load timetable information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const getClassName = (classId) => {
    const cls = classes.find(
      (c) => String(c.id) === String(classId)
    );

    if (!cls) return "Unknown Class";

    return cls.section
      ? `${cls.name} - ${cls.section}`
      : cls.name;
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(
      (t) => String(t.id) === String(teacherId)
    );

    return teacher?.name || "Unknown Teacher";
  };

  const getSlotClassId = (slot) => {
    return (
      slot.class_id ??
      slot.classId ??
      slot.class?.id
    );
  };

  const getSlotTeacherId = (slot) => {
    return (
      slot.teacher_id ??
      slot.teacherId ??
      slot.teacher?.id
    );
  };

  const getSlotDay = (slot) => {
    return slot.day || slot.day_name;
  };

  const getStartMinutes = (time) => {
    if (!time) return 0;

    const [hours, minutes] = time
      .slice(0, 5)
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  };

  const getEndMinutes = (time) => {
    return getStartMinutes(time);
  };

  const timesOverlap = (
    startA,
    endA,
    startB,
    endB
  ) => {
    return (
      getStartMinutes(startA) <
        getEndMinutes(endB) &&
      getStartMinutes(endA) >
        getEndMinutes(startB)
    );
  };

  const formatTime = (time) => {
    if (!time) return "";

    const [hour, minute] = time
      .slice(0, 5)
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(hour);
    date.setMinutes(minute);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const slotClassId = getSlotClassId(slot);
      const slotTeacherId = getSlotTeacherId(slot);
      const slotDay = getSlotDay(slot);

      const classMatch =
        classFilter === "all" ||
        String(slotClassId) === String(classFilter);

      const teacherMatch =
        teacherFilter === "all" ||
        String(slotTeacherId) === String(teacherFilter);

      const dayMatch =
        dayFilter === "all" ||
        slotDay === dayFilter;

      return classMatch && teacherMatch && dayMatch;
    });
  }, [
    slots,
    classFilter,
    teacherFilter,
    dayFilter,
  ]);

  // --------------------------------------------------
  // GET DAY SLOTS
  // --------------------------------------------------

  const getSlotsForDay = (day) => {
    return filteredSlots
      .filter((slot) => getSlotDay(slot) === day)
      .sort(
        (a, b) =>
          getStartMinutes(a.start_time) -
          getStartMinutes(b.start_time)
      );
  };

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setEditingId(null);
    setError("");
    setSuccess("");

    setForm({
      ...emptyForm,
      class_id:
        classFilter !== "all"
          ? String(classFilter)
          : classes.length
          ? String(classes[0].id)
          : "",
      teacher_id:
        teacherFilter !== "all"
          ? String(teacherFilter)
          : "",
      day:
        dayFilter !== "all"
          ? dayFilter
          : "Monday",
    });

    setModalOpen(true);
  };

  // --------------------------------------------------
  // OPEN EDIT MODAL
  // --------------------------------------------------

  const openEditModal = (slot) => {
    setEditingId(slot.id);
    setError("");
    setSuccess("");

    setForm({
      class_id: String(getSlotClassId(slot) || ""),
      subject: slot.subject || "",
      teacher_id: String(getSlotTeacherId(slot) || ""),
      day: getSlotDay(slot) || "Monday",
      start_time: slot.start_time?.slice(0, 5) || "09:00",
      end_time: slot.end_time?.slice(0, 5) || "10:00",
      room: slot.room || "",
    });

    setModalOpen(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // --------------------------------------------------
  // FRONTEND COLLISION CHECK
  // --------------------------------------------------

  const checkCollision = () => {
    const start = getStartMinutes(form.start_time);
    const end = getEndMinutes(form.end_time);

    if (end <= start) {
      return "End time must be after start time.";
    }

    const collision = slots.find((slot) => {
      // Current editing slot ko ignore karo
      if (
        editingId &&
        String(slot.id) === String(editingId)
      ) {
        return false;
      }

      const sameDay =
        getSlotDay(slot) === form.day;

      if (!sameDay) return false;

      const slotStart = slot.start_time;
      const slotEnd = slot.end_time;

      const overlap = timesOverlap(
        form.start_time,
        form.end_time,
        slotStart,
        slotEnd
      );

      if (!overlap) return false;

      const sameTeacher =
        String(getSlotTeacherId(slot)) ===
        String(form.teacher_id);

      const sameClass =
        String(getSlotClassId(slot)) ===
        String(form.class_id);

      if (sameTeacher) {
        return `Teacher ${getTeacherName(
          form.teacher_id
        )} already has a class from ${formatTime(
          slotStart
        )} to ${formatTime(
          slotEnd
        )} on ${form.day}.`;
      }

      if (sameClass) {
        return `This class already has a timetable slot from ${formatTime(
          slotStart
        )} to ${formatTime(
          slotEnd
        )} on ${form.day}.`;
      }

      return false;
    });

    return collision || null;
  };

  // --------------------------------------------------
  // SAVE TIMETABLE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.class_id) {
      setError("Please select a class.");
      return;
    }

    if (!form.teacher_id) {
      setError("Please select a teacher.");
      return;
    }

    if (!form.subject.trim()) {
      setError("Please enter subject name.");
      return;
    }

    const collisionError = checkCollision();

    if (collisionError) {
      setError(collisionError);
      return;
    }

    setSaving(true);

    try {
      const payload = {
        class_id: Number(form.class_id),
        teacher_id: Number(form.teacher_id),
        subject: form.subject.trim(),
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
        room: form.room.trim(),
      };

      if (editingId) {
        await api.put(
          `/timetable/${editingId}`,
          payload
        );

        setSuccess("Timetable slot updated successfully.");
      } else {
        await api.post("/timetable", payload);

        setSuccess("Timetable slot created successfully.");
      }

      setModalOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadData();
    } catch (err) {
      console.error("Timetable save error:", err);

      if (err.response?.status === 409) {
        setError(
          err.response?.data?.message ||
            "Teacher or class has a timetable conflict."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to save timetable slot."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timetable slot?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/timetable/${id}`);

      setSuccess("Timetable slot deleted successfully.");

      await loadData();
    } catch (err) {
      console.error("Delete timetable error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete timetable slot."
      );
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <DashboardLayout title="Class Timetable">
      <div className="space-y-6">

        {/* ------------------------------------------ */}
        {/* HEADER */}
        {/* ------------------------------------------ */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-xl bg-[#e7f7ea] text-[#2f9e44] flex items-center justify-center shrink-0">
              <CalendarDays size={22} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy-900">
                Class Timetable
              </h2>

              <p className="text-sm text-navy-900/50 mt-1">
                Create and manage weekly class schedules.
              </p>
            </div>

          </div>

          {canManage && (
            <button
              onClick={openAddModal}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Plus size={17} />
              Add Timetable Slot
            </button>
          )}

        </div>

        {/* ------------------------------------------ */}
        {/* MESSAGES */}
        {/* ------------------------------------------ */}

        {error && !modalOpen && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-brand-50 border border-brand-100 text-brand-600 rounded-xl px-4 py-3 text-sm">
            {success}
          </div>
        )}

        {/* ------------------------------------------ */}
        {/* FILTERS */}
        {/* ------------------------------------------ */}

        <div className="card p-4">

          <div className="flex items-center gap-2 mb-4">
            <Filter
              size={17}
              className="text-navy-900/50"
            />

            <h3 className="font-semibold text-navy-900">
              Timetable Filters
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* CLASS */}

            <div>
              <label className="form-label">
                Class
              </label>

              <select
                value={classFilter}
                onChange={(e) =>
                  setClassFilter(e.target.value)
                }
                className="form-input"
              >
                <option value="all">
                  All Classes
                </option>

                {classes.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.section
                      ? `${c.name} - ${c.section}`
                      : c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* TEACHER */}

            <div>
              <label className="form-label">
                Teacher
              </label>

              <select
                value={teacherFilter}
                onChange={(e) =>
                  setTeacherFilter(e.target.value)
                }
                className="form-input"
              >
                <option value="all">
                  All Teachers
                </option>

                {teachers.map((teacher) => (
                  <option
                    key={teacher.id}
                    value={teacher.id}
                  >
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DAY */}

            <div>
              <label className="form-label">
                Day
              </label>

              <select
                value={dayFilter}
                onChange={(e) =>
                  setDayFilter(e.target.value)
                }
                className="form-input"
              >
                <option value="all">
                  All Days
                </option>

                {DAYS.map((day) => (
                  <option
                    key={day}
                    value={day}
                  >
                    {day}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* ------------------------------------------ */}
        {/* TIMETABLE */}
        {/* ------------------------------------------ */}

        {loading ? (
          <div className="card p-10 text-center text-sm text-navy-900/40">
            Loading timetable...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

            {DAYS.map((day) => {
              const daySlots = getSlotsForDay(day);

              if (
                dayFilter !== "all" &&
                dayFilter !== day
              ) {
                return null;
              }

              return (
                <div
                  key={day}
                  className="card overflow-hidden"
                >

                  {/* DAY HEADER */}

                  <div className="px-5 py-4 border-b border-[#eef0f4] flex items-center justify-between">

                    <div>
                      <h3 className="font-bold text-lg text-navy-900">
                        {day}
                      </h3>

                      <p className="text-xs text-navy-900/40 mt-0.5">
                        {daySlots.length}{" "}
                        {daySlots.length === 1
                          ? "class"
                          : "classes"}
                      </p>
                    </div>

                    <Clock3
                      size={18}
                      className="text-navy-900/30"
                    />

                  </div>

                  {/* DAY CONTENT */}

                  <div className="p-4 space-y-3 min-h-[150px]">

                    {daySlots.length === 0 ? (
                      <div className="flex items-center justify-center min-h-[110px] text-sm text-navy-900/35">
                        No classes scheduled.
                      </div>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="rounded-xl border border-[#e5e8ee] bg-white p-4 hover:shadow-sm transition"
                        >

                          {/* TIME */}

                          <div className="flex items-center justify-between gap-2 mb-3">

                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2f9e44] bg-[#e7f7ea] rounded-lg px-2.5 py-1">
                              <Clock3 size={13} />

                              {formatTime(
                                slot.start_time
                              )}{" "}
                              -{" "}
                              {formatTime(
                                slot.end_time
                              )}
                            </div>

                            {canManage && (
                              <div className="flex items-center gap-1">

                                <button
                                  onClick={() =>
                                    openEditModal(slot)
                                  }
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-navy-900/50"
                                  title="Edit"
                                >
                                  <Pencil size={14} />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDelete(
                                      slot.id
                                    )
                                  }
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>

                              </div>
                            )}

                          </div>

                          {/* SUBJECT */}

                          <h4 className="font-bold text-navy-900">
                            {slot.subject || "Untitled Subject"}
                          </h4>

                          {/* CLASS */}

                          <div className="flex items-center gap-2 mt-3 text-sm text-navy-900/60">
                            <BookOpen size={15} />

                            <span>
                              {getClassName(
                                getSlotClassId(
                                  slot
                                )
                              )}
                            </span>
                          </div>

                          {/* TEACHER */}

                          <div className="flex items-center gap-2 mt-2 text-sm text-navy-900/60">
                            <UserRound size={15} />

                            <span>
                              {getTeacherName(
                                getSlotTeacherId(
                                  slot
                                )
                              )}
                            </span>
                          </div>

                          {/* ROOM */}

                          {slot.room && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-navy-900/60">
                              <DoorOpen size={15} />

                              <span>
                                Room {slot.room}
                              </span>
                            </div>
                          )}

                        </div>
                      ))
                    )}

                  </div>
                </div>
              );
            })}

          </div>
        )}

        {/* ------------------------------------------ */}
        {/* EMPTY RESULT */}
        {/* ------------------------------------------ */}

        {!loading &&
          filteredSlots.length === 0 && (
            <div className="card p-10 text-center">

              <CalendarDays
                size={42}
                className="mx-auto text-navy-900/20 mb-3"
              />

              <h3 className="font-bold text-navy-900">
                No timetable found
              </h3>

              <p className="text-sm text-navy-900/40 mt-1">
                Try changing the filters or add a new
                timetable slot.
              </p>

            </div>
          )}

      </div>

      {/* ========================================== */}
      {/* ADD / EDIT MODAL */}
      {/* ========================================== */}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-[#eef0f4]">

              <div>
                <h2 className="text-lg font-bold text-navy-900">
                  {editingId
                    ? "Edit Timetable Slot"
                    : "Add Timetable Slot"}
                </h2>

                <p className="text-xs text-navy-900/40 mt-1">
                  Set class, subject, teacher and timing.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-navy-900/50"
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5"
            >

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">

                  <AlertCircle
                    size={18}
                    className="shrink-0 mt-0.5"
                  />

                  <span>{error}</span>

                </div>
              )}

              {/* CLASS + TEACHER */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="form-label">
                    Class *
                  </label>

                  <select
                    name="class_id"
                    value={form.class_id}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">
                      Select Class
                    </option>

                    {classes.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                      >
                        {c.section
                          ? `${c.name} - ${c.section}`
                          : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Teacher *
                  </label>

                  <select
                    name="teacher_id"
                    value={form.teacher_id}
                    onChange={handleChange}
                    required
                    className="form-input"
                  >
                    <option value="">
                      Select Teacher
                    </option>

                    {teachers.map((teacher) => (
                      <option
                        key={teacher.id}
                        value={teacher.id}
                      >
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* SUBJECT */}

              <div>
                <label className="form-label">
                  Subject *
                </label>

                <input
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Mathematics"
                  className="form-input"
                />
              </div>

              {/* DAY */}

              <div>
                <label className="form-label">
                  Day *
                </label>

                <select
                  name="day"
                  value={form.day}
                  onChange={handleChange}
                  required
                  className="form-input"
                >
                  {DAYS.map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* TIME */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="form-label">
                    Start Time *
                  </label>

                  <input
                    type="time"
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    End Time *
                  </label>

                  <input
                    type="time"
                    name="end_time"
                    value={form.end_time}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

              </div>

              {/* ROOM */}

              <div>
                <label className="form-label">
                  Room
                </label>

                <input
                  name="room"
                  value={form.room}
                  onChange={handleChange}
                  placeholder="e.g. Room 204"
                  className="form-input"
                />
              </div>

              {/* INFO */}

              <div className="rounded-xl bg-[#f7f8fa] border border-[#eef0f4] p-4">

                <div className="flex items-start gap-2">

                  <AlertCircle
                    size={17}
                    className="text-[#2f9e44] mt-0.5"
                  />

                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      Conflict protection enabled
                    </p>

                    <p className="text-xs text-navy-900/50 mt-1">
                      A teacher cannot be assigned to two
                      classes at the same time. The same
                      class also cannot have two subjects
                      during overlapping timings.
                    </p>
                  </div>

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
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
                    ? "Update Slot"
                    : "Create Slot"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
