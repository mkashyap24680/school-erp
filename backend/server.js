require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { sequelize } = require("./models");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const classRoutes = require("./routes/classRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const feeRoutes = require("./routes/feeRoutes");
const examRoutes = require("./routes/examRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const parentRoutes = require("./routes/parentRoutes");
const transportRoutes = require("./routes/transportRoutes");
const hostelRoutes = require("./routes/hostelRoutes");
const homeworkRoutes = require("./routes/homeworkRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const quizRoutes = require("./routes/quizRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const eventRoutes = require("./routes/eventRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const schoolProfileRoutes = require("./routes/schoolProfileRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "School ERP API is running." });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/transport", transportRoutes);
app.use("/api/hostel", hostelRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/school-profile", schoolProfileRoutes);
app.use("/api/payments", paymentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong.", error: err.message });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");

    // Use { alter: true } during development to auto-sync schema changes.
    await sequelize.sync({ alter: true });
    console.log("Database synced.");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Unable to start server:", err);
    process.exit(1);
  }
}

start();
