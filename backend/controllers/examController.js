const { Exam, Result, Student, SchoolClass } = require("../models");
const { notifyUser } = require("../utils/notify");

// GET /api/exams
exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [{ model: SchoolClass, attributes: ["id", "name", "section"] }],
      order: [["exam_date", "DESC"]],
    });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch exams.", error: err.message });
  }
};

// POST /api/exams (admin, management, teacher)
exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: "Failed to create exam.", error: err.message });
  }
};

// PUT /api/exams/:id
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    await exam.update(req.body);
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: "Failed to update exam.", error: err.message });
  }
};

// DELETE /api/exams/:id (admin only)
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found." });
    await exam.destroy();
    res.json({ message: "Exam deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete exam.", error: err.message });
  }
};

// GET /api/exams/:examId/results
exports.getResultsForExam = async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { exam_id: req.params.examId },
      include: [{ model: Student, attributes: ["id", "name", "roll_no"] }],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results.", error: err.message });
  }
};

// POST /api/exams/:examId/results/bulk  (admin, management, teacher)
// body: { records: [{ student_id, marks_obtained, remarks }] }
exports.enterResultsBulk = async (req, res) => {
  try {
    const examId = req.params.examId;
    const { records } = req.body;
    if (!Array.isArray(records)) {
      return res.status(400).json({ message: "records[] is required." });
    }

    const saved = [];
    for (const r of records) {
      const [result] = await Result.findOrCreate({
        where: { exam_id: examId, student_id: r.student_id },
        defaults: { marks_obtained: r.marks_obtained, remarks: r.remarks },
      });
      if (result.marks_obtained !== r.marks_obtained) {
        result.marks_obtained = r.marks_obtained;
        result.remarks = r.remarks;
        await result.save();
      }
      saved.push(result);

      const student = await Student.findByPk(r.student_id);
      if (student?.user_id) {
        const exam = await Exam.findByPk(examId);
        await notifyUser(student.user_id, {
          title: "Exam Result Published",
          message: `${exam?.name || "Exam"}: You scored ${r.marks_obtained}/${exam?.total_marks || ""}.`,
          type: "result",
        });
      }
    }

    res.status(201).json({ message: "Results saved.", records: saved });
  } catch (err) {
    res.status(500).json({ message: "Failed to save results.", error: err.message });
  }
};

// GET /api/exams/results/student/:studentId (admin, management, teacher)
exports.getResultsForStudent = async (req, res) => {
  try {
    const results = await Result.findAll({
      where: { student_id: req.params.studentId },
      include: [{ model: Exam, attributes: ["id", "name", "subject", "exam_date", "total_marks"] }],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results.", error: err.message });
  }
};

// GET /api/exams/results/me (student's own results)
exports.getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const results = await Result.findAll({
      where: { student_id: student.id },
      include: [{ model: Exam, attributes: ["id", "name", "subject", "exam_date", "total_marks"] }],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results.", error: err.message });
  }
};
