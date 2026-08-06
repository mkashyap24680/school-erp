import { useEffect, useRef, useState } from "react";
import { Menu, LogOut, Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

export default function Topbar({ onMenuClick, title }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const load = () => {
    api.get("/announcements").then((res) => setAnnouncements(res.data.slice(0, 5))).catch(() => {});
    api.get("/notifications/me").then((res) => setNotifications(res.data.slice(0, 8))).catch(() => {});
  };

  useEffect(load, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleBellClick = () => {
    setNotifOpen((o) => !o);
    if (!notifOpen && unreadCount > 0) {
      api.put("/notifications/read-all").then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }).catch(() => {});
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="topbar-surface sticky top-0 z-20 bg-white border-b border-[#eef0f4] px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-navy-900" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <h1 className="text-lg sm:text-xl font-bold text-navy-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={toggleTheme} className="text-navy-900/70 hover:text-navy-900" title="Toggle dark mode">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className="relative" ref={notifRef}>
          <button className="relative text-navy-900/70 hover:text-navy-900" onClick={handleBellClick}>
            <Bell size={20} />
            {(unreadCount > 0 || announcements.length > 0) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-brand-500 rounded-full" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto card p-2 z-50">
              {notifications.length > 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-bold text-navy-900/50 uppercase tracking-wide">Your Notifications</div>
                  {notifications.map((n) => (
                    <div key={n.id} className="px-3 py-2 rounded-lg hover:bg-[#f7f8fa]">
                      <div className="text-sm font-semibold text-navy-900">{n.title}</div>
                      <div className="text-xs text-navy-900/50 line-clamp-2">{n.message}</div>
                    </div>
                  ))}
                </>
              )}
              <div className="px-3 py-2 text-xs font-bold text-navy-900/50 uppercase tracking-wide">Announcements</div>
              {announcements.length === 0 && (
                <div className="px-3 py-4 text-sm text-navy-900/40 text-center">No announcements yet.</div>
              )}
              {announcements.map((a) => (
                <div key={a.id} className="px-3 py-2 rounded-lg hover:bg-[#f7f8fa]">
                  <div className="text-sm font-semibold text-navy-900">{a.title}</div>
                  <div className="text-xs text-navy-900/50 line-clamp-2">{a.message}</div>
                </div>
              ))}
              <Link
                to="/announcements"
                onClick={() => setNotifOpen(false)}
                className="block text-center text-xs font-semibold text-brand-600 py-2 hover:underline"
              >
                View all announcements
              </Link>
            </div>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#eef0f4]">
          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-600 font-bold flex items-center justify-center text-sm">
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-navy-900">{user?.name}</div>
            <div className="text-xs text-navy-900/50 capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
