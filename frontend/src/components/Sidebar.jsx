import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarCheck, FileText, Wallet,
  BarChart3, Settings, ShieldCheck, Megaphone, CalendarClock, Library, History, Heart,
  Bus, Building2, ClipboardList, CalendarOff, IndianRupee, ClipboardCheck, Award,
  UserPlus, CalendarDays, Boxes, TrendingUp, X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSchoolProfile } from "../context/SchoolProfileContext";

const ALL_ITEMS = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard, roles: ["admin", "management", "teacher", "student", "parent"] },
  { to: "/my-children", key: "myChildren", icon: Heart, roles: ["parent"] },
  { to: "/enquiries", key: "enquiries", icon: UserPlus, roles: ["admin", "management"] },
  { to: "/students", key: "students", icon: Users, roles: ["admin", "management", "teacher"] },
  { to: "/teachers", key: "teachers", icon: GraduationCap, roles: ["admin", "management"] },
  { to: "/classes", key: "classes", icon: BookOpen, roles: ["admin", "management", "teacher", "student"] },
  { to: "/attendance", key: "attendance", icon: CalendarCheck, roles: ["admin", "management", "teacher", "student"] },
  { to: "/timetable", key: "timetable", icon: CalendarClock, roles: ["admin", "management", "teacher", "student"] },
  { to: "/homework", key: "homework", icon: ClipboardList, roles: ["admin", "management", "teacher", "student"] },
  { to: "/exams", key: "examination", icon: FileText, roles: ["admin", "management", "teacher", "student"] },
  { to: "/quizzes", key: "quizzes", icon: ClipboardCheck, roles: ["admin", "management", "teacher", "student"] },
  { to: "/fees", key: "fees", icon: Wallet, roles: ["admin", "management", "student"] },
  { to: "/library", key: "library", icon: Library, roles: ["admin", "management", "student"] },
  { to: "/transport", key: "transport", icon: Bus, roles: ["admin", "management", "student"] },
  { to: "/hostel", key: "hostel", icon: Building2, roles: ["admin", "management"] },
  { to: "/leave", key: "leaveManagement", icon: CalendarOff, roles: ["admin", "management", "teacher", "student"] },
  { to: "/payroll", key: "payroll", icon: IndianRupee, roles: ["admin"] },
  { to: "/inventory", key: "inventory", icon: Boxes, roles: ["admin", "management"] },
  { to: "/events", key: "events", icon: CalendarDays, roles: ["admin", "management", "teacher", "student", "parent"] },
  { to: "/certificates", key: "certificates", icon: Award, roles: ["admin", "management"] },
  { to: "/announcements", key: "announcements", icon: Megaphone, roles: ["admin", "management", "teacher", "student", "parent"] },
  { to: "/reports", key: "reportsAnalytics", icon: BarChart3, roles: ["admin", "management"] },
  { to: "/analytics", key: "analytics", icon: TrendingUp, roles: ["admin", "management", "teacher"] },
  { to: "/users", key: "userAccess", icon: ShieldCheck, roles: ["admin"] },
  { to: "/audit-log", key: "auditLog", icon: History, roles: ["admin"] },
  { to: "/settings", key: "settings", icon: Settings, roles: ["admin", "management", "teacher", "student", "parent"] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { profile } = useSchoolProfile();
  const items = ALL_ITEMS.filter((item) => item.roles.includes(user?.role));

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-navy-900 text-white flex flex-col z-40 transform transition-transform duration-200
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            {profile?.logo_base64 ? (
              <img src={profile.logo_base64} alt="Logo" className="w-9 h-9 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-navy-900 shrink-0" style={{ background: profile?.primary_color || "#2f9e44" }}>
                {profile?.school_name?.[0] || "S"}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold text-sm leading-tight truncate">{profile?.school_name || "School ERP"}</div>
              <div className="text-[11px] text-white/50 truncate">{profile?.tagline || "Management System"}</div>
            </div>
          </div>
          <button className="lg:hidden text-white/70" onClick={onClose}><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map(({ to, key, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-500 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10 text-[11px] text-white/40">
          Logged in as <span className="text-white/70 capitalize">{user?.role}</span>
        </div>
      </aside>
    </>
  );
}
