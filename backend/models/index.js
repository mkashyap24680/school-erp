const sequelize = require("../config/db");
const User = require("./User");
const SchoolClass = require("./SchoolClass");
const Teacher = require("./Teacher");
const Student = require("./Student");
const StudentAcademicHistory = require("./StudentAcademicHistory");
const Attendance = require("./Attendance");
const Fee = require("./Fee");
const Exam = require("./Exam");
const Result = require("./Result");
const Announcement = require("./Announcement");
const TimetableSlot = require("./TimetableSlot");
const Book = require("./Book");
const BookIssue = require("./BookIssue");
const AuditLog = require("./AuditLog");
const Vehicle = require("./Vehicle");
const TransportRoute = require("./TransportRoute");
const Hostel = require("./Hostel");
const Room = require("./Room");
const Assignment = require("./Assignment");
const Submission = require("./Submission");
const Notification = require("./Notification");
const LeaveRequest = require("./LeaveRequest");
const Payroll = require("./Payroll");
const Quiz = require("./Quiz");
const Question = require("./Question");
const QuizAttempt = require("./QuizAttempt");
const Enquiry = require("./Enquiry");
const Event = require("./Event");
const InventoryItem = require("./InventoryItem");
const SchoolProfile = require("./SchoolProfile");
const Payment = require("./Payment");

// ---- Associations ----

// User <-> Teacher / Student (login account link)
User.hasOne(Teacher, { foreignKey: "user_id" });
Teacher.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Student, { foreignKey: "user_id" });
Student.belongsTo(User, { foreignKey: "user_id" });

// Parent Portal: a parent User can be guardian of many Students
User.hasMany(Student, { foreignKey: "guardian_user_id", as: "children" });
Student.belongsTo(User, { foreignKey: "guardian_user_id", as: "guardian" });

// Class <-> Teacher (class teacher)
SchoolClass.belongsTo(Teacher, { foreignKey: "teacher_id", as: "classTeacher" });
Teacher.hasMany(SchoolClass, { foreignKey: "teacher_id", as: "classesHandled" });

// Class <-> Student
SchoolClass.hasMany(Student, { foreignKey: "class_id" });
Student.belongsTo(SchoolClass, { foreignKey: "class_id" });

// Student Academic History
Student.hasMany(StudentAcademicHistory, {
  foreignKey: "student_id",
  as: "academicHistory",
});

StudentAcademicHistory.belongsTo(Student, {
  foreignKey: "student_id",
  as: "student",
});

SchoolClass.hasMany(StudentAcademicHistory, {
  foreignKey: "class_id",
  as: "academicHistory",
});

StudentAcademicHistory.belongsTo(SchoolClass, {
  foreignKey: "class_id",
  as: "class",
});

// Attendance
Student.hasMany(Attendance, { foreignKey: "student_id" });
Attendance.belongsTo(Student, { foreignKey: "student_id" });
SchoolClass.hasMany(Attendance, { foreignKey: "class_id" });
Attendance.belongsTo(SchoolClass, { foreignKey: "class_id" });

// Fees
Student.hasMany(Fee, { foreignKey: "student_id" });
Fee.belongsTo(Student, { foreignKey: "student_id" });

// Exams & Results
SchoolClass.hasMany(Exam, { foreignKey: "class_id" });
Exam.belongsTo(SchoolClass, { foreignKey: "class_id" });

Exam.hasMany(Result, { foreignKey: "exam_id" });
Result.belongsTo(Exam, { foreignKey: "exam_id" });

Student.hasMany(Result, { foreignKey: "student_id" });
Result.belongsTo(Student, { foreignKey: "student_id" });

// Timetable
SchoolClass.hasMany(TimetableSlot, { foreignKey: "class_id" });
TimetableSlot.belongsTo(SchoolClass, { foreignKey: "class_id" });
Teacher.hasMany(TimetableSlot, { foreignKey: "teacher_id" });
TimetableSlot.belongsTo(Teacher, { foreignKey: "teacher_id" });

// Library
Book.hasMany(BookIssue, { foreignKey: "book_id" });
BookIssue.belongsTo(Book, { foreignKey: "book_id" });
Student.hasMany(BookIssue, { foreignKey: "student_id" });
BookIssue.belongsTo(Student, { foreignKey: "student_id" });

// Transport
TransportRoute.belongsTo(Vehicle, { foreignKey: "vehicle_id" });
Vehicle.hasMany(TransportRoute, { foreignKey: "vehicle_id" });
Student.belongsTo(TransportRoute, { foreignKey: "route_id", as: "route" });
TransportRoute.hasMany(Student, { foreignKey: "route_id" });

// Hostel
Hostel.hasMany(Room, { foreignKey: "hostel_id" });
Room.belongsTo(Hostel, { foreignKey: "hostel_id" });
Student.belongsTo(Room, { foreignKey: "hostel_room_id", as: "hostelRoom" });
Room.hasMany(Student, { foreignKey: "hostel_room_id" });

// Homework
SchoolClass.hasMany(Assignment, { foreignKey: "class_id" });
Assignment.belongsTo(SchoolClass, { foreignKey: "class_id" });
Teacher.hasMany(Assignment, { foreignKey: "teacher_id" });
Assignment.belongsTo(Teacher, { foreignKey: "teacher_id" });
Assignment.hasMany(Submission, { foreignKey: "assignment_id" });
Submission.belongsTo(Assignment, { foreignKey: "assignment_id" });
Student.hasMany(Submission, { foreignKey: "student_id" });
Submission.belongsTo(Student, { foreignKey: "student_id" });

// Payroll
Teacher.hasMany(Payroll, { foreignKey: "teacher_id" });
Payroll.belongsTo(Teacher, { foreignKey: "teacher_id" });

// Quiz
SchoolClass.hasMany(Quiz, { foreignKey: "class_id" });
Quiz.belongsTo(SchoolClass, { foreignKey: "class_id" });
Quiz.hasMany(Question, { foreignKey: "quiz_id" });
Question.belongsTo(Quiz, { foreignKey: "quiz_id" });
Quiz.hasMany(QuizAttempt, { foreignKey: "quiz_id" });
QuizAttempt.belongsTo(Quiz, { foreignKey: "quiz_id" });
Student.hasMany(QuizAttempt, { foreignKey: "student_id" });
QuizAttempt.belongsTo(Student, { foreignKey: "student_id" });

// Payments
Fee.hasMany(Payment, { foreignKey: "fee_id" });
Payment.belongsTo(Fee, { foreignKey: "fee_id" });

module.exports = {
  sequelize,
  User,
  SchoolClass,
  Teacher,
  Student,
  StudentAcademicHistory,
  Attendance,
  Fee,
  Exam,
  Result,
  Announcement,
  TimetableSlot,
  Book,
  BookIssue,
  AuditLog,
  Vehicle,
  TransportRoute,
  Hostel,
  Room,
  Assignment,
  Submission,
  Notification,
  LeaveRequest,
  Payroll,
  Quiz,
  Question,
  QuizAttempt,
  Enquiry,
  Event,
  InventoryItem,
  SchoolProfile,
  Payment,
};
