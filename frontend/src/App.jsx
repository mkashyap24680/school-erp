import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Exams from "./pages/Exams";
import Reports from "./pages/Reports";
import UsersPage from "./pages/UsersPage";
import Settings from "./pages/Settings";
import Announcements from "./pages/Announcements";
import Timetable from "./pages/Timetable";
import Library from "./pages/Library";
import AuditLog from "./pages/AuditLog";
import MyChildren from "./pages/MyChildren";
import Transport from "./pages/Transport";
import Hostel from "./pages/Hostel";
import Homework from "./pages/Homework";
import Leave from "./pages/Leave";
import Payroll from "./pages/Payroll";
import Quiz from "./pages/Quiz";
import Certificates from "./pages/Certificates";
import AdmissionEnquiry from "./pages/AdmissionEnquiry";
import Enquiries from "./pages/Enquiries";
import Events from "./pages/Events";
import Inventory from "./pages/Inventory";
import StudentAnalytics from "./pages/StudentAnalytics";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admissions" element={<AdmissionEnquiry />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/my-children" element={<ProtectedRoute roles={["parent"]}><MyChildren /></ProtectedRoute>} />
      <Route path="/enquiries" element={<ProtectedRoute roles={["admin", "management"]}><Enquiries /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute roles={["admin", "management", "teacher"]}><Students /></ProtectedRoute>} />
      <Route path="/teachers" element={<ProtectedRoute roles={["admin", "management"]}><Teachers /></ProtectedRoute>} />
      <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
      <Route path="/homework" element={<ProtectedRoute roles={["admin", "management", "teacher", "student"]}><Homework /></ProtectedRoute>} />
      <Route path="/fees" element={<ProtectedRoute roles={["admin", "management", "student"]}><Fees /></ProtectedRoute>} />
      <Route path="/library" element={<ProtectedRoute roles={["admin", "management", "student"]}><Library /></ProtectedRoute>} />
      <Route path="/transport" element={<ProtectedRoute roles={["admin", "management", "student"]}><Transport /></ProtectedRoute>} />
      <Route path="/hostel" element={<ProtectedRoute roles={["admin", "management"]}><Hostel /></ProtectedRoute>} />
      <Route path="/leave" element={<ProtectedRoute roles={["admin", "management", "teacher", "student"]}><Leave /></ProtectedRoute>} />
      <Route path="/payroll" element={<ProtectedRoute roles={["admin"]}><Payroll /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute roles={["admin", "management"]}><Inventory /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute roles={["admin", "management"]}><Certificates /></ProtectedRoute>} />
      <Route path="/exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute roles={["admin", "management", "teacher", "student"]}><Quiz /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute roles={["admin", "management", "teacher"]}><StudentAnalytics /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={["admin", "management"]}><Reports /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={["admin"]}><UsersPage /></ProtectedRoute>} />
      <Route path="/audit-log" element={<ProtectedRoute roles={["admin"]}><AuditLog /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
