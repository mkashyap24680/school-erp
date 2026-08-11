const {
  Assignment,
  Submission,
  Student,
  SchoolClass,
  Teacher,
} = require("../models");

const { notifyUser } = require("../utils/notify");
const { logAction } = require("../utils/audit");

// ---------------------------------------------------------
// GET /api/homework
// admin, management, teacher
// Optional: ?class_id=
// ---------------------------------------------------------

exports.getAssignments = async (req, res) => {
  try {
    const where = {};

    if (req.query.class_id) {
      where.class_id = req.query.class_id;
    }

    const assignments = await Assignment.findAll({
      where,
      include: [
        {
          model: SchoolClass,
          attributes: [
            "id",
            "course_name",
            "course_code",
            "department_name",
            "department_code",
            "year",
            "semester",
            "session",
            "section",
          ],
        },
        {
          model: Teacher,
          attributes: ["id", "name"],
          required: false,
        },
      ],
      order: [["due_date", "DESC"]],
    });

    res.json(assignments);
  } catch (err) {
    console.error("getAssignments:", err);

    res.status(500).json({
      message: "Failed to fetch assignments.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// GET /api/homework/me
// Student - ONLY assignments of their own class
// Includes ONLY their own submission
// ---------------------------------------------------------

exports.getMyAssignments = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    if (!student.class_id) {
      return res.json([]);
    }

    const assignments = await Assignment.findAll({
      where: {
        class_id: student.class_id,
      },
      include: [
        {
          model: SchoolClass,
          attributes: [
            "id",
            "course_name",
            "course_code",
            "department_name",
            "department_code",
            "year",
            "semester",
            "session",
            "section",
          ],
        },
        {
          model: Submission,
          required: false,
          where: {
            student_id: student.id,
          },
          attributes: [
            "id",
            "assignment_id",
            "student_id",
            "content",
            "submitted_at",
            "status",
            "grade",
            "feedback",
          ],
        },
      ],
      order: [["due_date", "DESC"]],
    });

    res.json(assignments);
  } catch (err) {
    console.error("getMyAssignments:", err);

    res.status(500).json({
      message: "Failed to fetch your assignments.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// POST /api/homework
// admin, management, teacher
// ---------------------------------------------------------

exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);

    const students = await Student.findAll({
      where: {
        class_id: assignment.class_id,
      },
    });

    for (const student of students) {
      if (student.user_id) {
        await notifyUser(student.user_id, {
          title: "New Homework Assigned",
          message: `${assignment.title} (${assignment.subject || "Homework"}) — due ${
            assignment.due_date || "soon"
          }.`,
          type: "homework",
        });
      }
    }

    await logAction(req, {
      action: "create",
      entity: "Assignment",
      entityId: assignment.id,
      details: {
        title: assignment.title,
      },
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("createAssignment:", err);

    res.status(500).json({
      message: "Failed to create assignment.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// DELETE /api/homework/:id
// ---------------------------------------------------------

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    await assignment.destroy();

    res.json({
      message: "Assignment deleted.",
    });
  } catch (err) {
    console.error("deleteAssignment:", err);

    res.status(500).json({
      message: "Failed to delete assignment.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// GET /api/homework/:id/submissions
// admin, management, teacher
// ---------------------------------------------------------

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.findAll({
      where: {
        assignment_id: req.params.id,
      },
      include: [
        {
          model: Student,
          attributes: ["id", "name", "roll_no"],
        },
      ],
    });

    res.json(submissions);
  } catch (err) {
    console.error("getSubmissions:", err);

    res.status(500).json({
      message: "Failed to fetch submissions.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// POST /api/homework/:id/submit
// Student - ONLY their own submission
// ---------------------------------------------------------

exports.submitAssignment = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: {
        user_id: req.user.id,
      },
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    const assignment = await Assignment.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    // Student can submit only assignment belonging to own class
    if (
      !student.class_id ||
      String(assignment.class_id) !== String(student.class_id)
    ) {
      return res.status(403).json({
        message: "You cannot submit this assignment.",
      });
    }

    const [submission, created] = await Submission.findOrCreate({
      where: {
        assignment_id: assignment.id,
        student_id: student.id,
      },
      defaults: {
        content: req.body.content || "",
        submitted_at: new Date(),
        status: "submitted",
      },
    });

    if (!created) {
      submission.content = req.body.content || "";
      submission.submitted_at = new Date();
      submission.status = "submitted";

      await submission.save();
    }

    res.status(201).json(submission);
  } catch (err) {
    console.error("submitAssignment:", err);

    res.status(500).json({
      message: "Failed to submit assignment.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// PUT /api/homework/submissions/:id/grade
// admin, management, teacher
// ---------------------------------------------------------

exports.gradeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findByPk(req.params.id);

    if (!submission) {
      return res.status(404).json({
        message: "Submission not found.",
      });
    }

    submission.grade = req.body.grade;
    submission.feedback = req.body.feedback;
    submission.status = "graded";

    await submission.save();

    const student = await Student.findByPk(
      submission.student_id
    );

    if (student?.user_id) {
      await notifyUser(student.user_id, {
        title: "Homework Graded",
        message: `Your submission was graded: ${
          req.body.grade || ""
        }`,
        type: "homework",
      });
    }

    res.json(submission);
  } catch (err) {
    console.error("gradeSubmission:", err);

    res.status(500).json({
      message: "Failed to grade submission.",
      error: err.message,
    });
  }
};
