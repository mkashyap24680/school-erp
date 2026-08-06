const { Book, BookIssue, Student } = require("../models");
const { logAction } = require("../utils/audit");

// ---- Books ----

// GET /api/library/books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({ order: [["title", "ASC"]] });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch books.", error: err.message });
  }
};

// POST /api/library/books (admin, management)
exports.createBook = async (req, res) => {
  try {
    const { total_copies = 1 } = req.body;
    const book = await Book.create({ ...req.body, available_copies: total_copies });
    await logAction(req, { action: "create", entity: "Book", entityId: book.id, details: { title: book.title } });
    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: "Failed to create book.", error: err.message });
  }
};

// PUT /api/library/books/:id
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });
    await book.update(req.body);
    await logAction(req, { action: "update", entity: "Book", entityId: book.id, details: req.body });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Failed to update book.", error: err.message });
  }
};

// DELETE /api/library/books/:id (admin)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });
    await logAction(req, { action: "delete", entity: "Book", entityId: book.id, details: { title: book.title } });
    await book.destroy();
    res.json({ message: "Book deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete book.", error: err.message });
  }
};

// ---- Issue / Return ----

// GET /api/library/issues
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await BookIssue.findAll({
      include: [
        { model: Book, attributes: ["id", "title", "author"] },
        { model: Student, attributes: ["id", "name", "roll_no"] },
      ],
      order: [["issue_date", "DESC"]],
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch issues.", error: err.message });
  }
};

// GET /api/library/issues/me (student's own issued books)
exports.getMyIssues = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: "Student profile not found." });
    const issues = await BookIssue.findAll({
      where: { student_id: student.id },
      include: [{ model: Book, attributes: ["id", "title", "author"] }],
      order: [["issue_date", "DESC"]],
    });
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch issues.", error: err.message });
  }
};

// POST /api/library/issues (admin, management) - issue a book to a student
exports.issueBook = async (req, res) => {
  try {
    const { book_id, student_id, due_date } = req.body;
    const book = await Book.findByPk(book_id);
    if (!book) return res.status(404).json({ message: "Book not found." });
    if (book.available_copies <= 0) {
      return res.status(400).json({ message: "No copies available for this book." });
    }

    const issue = await BookIssue.create({
      book_id, student_id,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date,
      status: "issued",
    });

    book.available_copies -= 1;
    await book.save();

    await logAction(req, { action: "issue", entity: "BookIssue", entityId: issue.id, details: { book_id, student_id } });
    res.status(201).json(issue);
  } catch (err) {
    res.status(500).json({ message: "Failed to issue book.", error: err.message });
  }
};

// PUT /api/library/issues/:id/return (admin, management) - mark returned
exports.returnBook = async (req, res) => {
  try {
    const issue = await BookIssue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue record not found." });
    if (issue.status === "returned") {
      return res.status(400).json({ message: "This book has already been returned." });
    }

    issue.status = "returned";
    issue.return_date = new Date().toISOString().slice(0, 10);
    await issue.save();

    const book = await Book.findByPk(issue.book_id);
    if (book) {
      book.available_copies += 1;
      await book.save();
    }

    await logAction(req, { action: "return", entity: "BookIssue", entityId: issue.id });
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: "Failed to process return.", error: err.message });
  }
};
