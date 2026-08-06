const { Quiz, Question, QuizAttempt, Student, SchoolClass } = require("../models");
const { logAction } = require("../utils/audit");

// GET /api/quizzes?class_id=
exports.getQuizzes = async (req, res) => {
  try {
    const where = {};
    if (req.query.class_id) where.class_id = req.query.class_id;
    const quizzes = await Quiz.findAll({
      where,
      include: [{ model: SchoolClass, attributes: ["id", "name", "section"] }],
      order: [["created_at", "DESC"]],
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quizzes.", error: err.message });
  }
};

// GET /api/quizzes/me - student's quizzes for their class, with attempt status
exports.getMyQuizzes = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student || !student.class_id) return res.json([]);

    const quizzes = await Quiz.findAll({
      where: { class_id: student.class_id, is_published: true },
      include: [{
        model: QuizAttempt,
        required: false,
        where: { student_id: student.id },
      }],
      order: [["created_at", "DESC"]],
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quizzes.", error: err.message });
  }
};

// GET /api/quizzes/:id (with questions — correct_option hidden for students)
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, { include: [{ model: Question }] });
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });

    const json = quiz.toJSON();
    if (req.user.role === "student") {
      json.Questions = json.Questions.map(({ correct_option, ...q }) => q);
    }
    res.json(json);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quiz.", error: err.message });
  }
};

// POST /api/quizzes (admin, management, teacher) - body: { ...quizFields, questions: [...] }
exports.createQuiz = async (req, res) => {
  try {
    const { questions = [], ...quizFields } = req.body;
    const quiz = await Quiz.create({ ...quizFields, created_by: req.user.id });

    for (const q of questions) {
      await Question.create({ ...q, quiz_id: quiz.id });
    }

    await logAction(req, { action: "create", entity: "Quiz", entityId: quiz.id, details: { title: quiz.title } });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Failed to create quiz.", error: err.message });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found." });
    await quiz.destroy();
    res.json({ message: "Quiz deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete quiz.", error: err.message });
  }
};

// POST /api/quizzes/:id/attempt (student) - body: { answers: { questionId: "a" } }
exports.submitAttempt = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const existing = await QuizAttempt.findOne({ where: { quiz_id: req.params.id, student_id: student.id } });
    if (existing) return res.status(400).json({ message: "You have already attempted this quiz." });

    const questions = await Question.findAll({ where: { quiz_id: req.params.id } });
    const { answers = {} } = req.body;

    let score = 0;
    let totalMarks = 0;
    questions.forEach((q) => {
      totalMarks += q.marks;
      if (answers[q.id] === q.correct_option) score += q.marks;
    });

    const attempt = await QuizAttempt.create({
      quiz_id: req.params.id,
      student_id: student.id,
      answers: JSON.stringify(answers),
      score,
      total_marks: totalMarks,
      submitted_at: new Date(),
    });

    res.status(201).json(attempt);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit quiz.", error: err.message });
  }
};

// GET /api/quizzes/:id/results (admin, management, teacher)
exports.getQuizResults = async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { quiz_id: req.params.id },
      include: [{ model: Student, attributes: ["id", "name", "roll_no"] }],
    });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch quiz results.", error: err.message });
  }
};
