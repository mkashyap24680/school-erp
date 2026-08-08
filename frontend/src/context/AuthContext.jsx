import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext(null);

const IDLE_LIMIT_MS = 15 * 60 * 1000; // 15 minutes of inactivity
const WARNING_BEFORE_MS = 60 * 1000;  // show a warning 60s before logout
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("erp_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const navigate = useNavigate();

  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastResetRef = useRef(0);

  useEffect(() => {
    const token = localStorage.getItem("erp_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        localStorage.setItem("erp_user", JSON.stringify(res.data));
      })
      .catch(() => {
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erp_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("erp_token", res.data.token);
    localStorage.setItem("erp_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (payload) => {
    const res = await api.post("/auth/signup", payload);
    localStorage.setItem("erp_token", res.data.token);
    localStorage.setItem("erp_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = useCallback(() => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_user");
    setUser(null);
  }, []);

  const clearIdleTimers = useCallback(() => {
    clearTimeout(warningTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownIntervalRef.current);
  }, []);

  const forceIdleLogout = useCallback(() => {
    clearIdleTimers();
    setShowIdleWarning(false);
    logout();
    navigate("/login", { state: { reason: "idle" } });
  }, [clearIdleTimers, logout, navigate]);

  const startIdleTimers = useCallback(() => {
    clearIdleTimers();
    warningTimerRef.current = setTimeout(() => {
      setShowIdleWarning(true);
      setSecondsLeft(Math.round(WARNING_BEFORE_MS / 1000));
      countdownIntervalRef.current = setInterval(() => {
        setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      }, 1000);
    }, IDLE_LIMIT_MS - WARNING_BEFORE_MS);

    logoutTimerRef.current = setTimeout(forceIdleLogout, IDLE_LIMIT_MS);
  }, [clearIdleTimers, forceIdleLogout]);

  const stayLoggedIn = useCallback(() => {
    setShowIdleWarning(false);
    startIdleTimers();
  }, [startIdleTimers]);

  // Track user activity — ignored while the warning modal is showing, so a
  // stray mouse twitch doesn't silently dismiss the warning; the user must
  // explicitly click "Stay Logged In".
  useEffect(() => {
    if (!user) {
      clearIdleTimers();
      setShowIdleWarning(false);
      return;
    }

    startIdleTimers();

    const handleActivity = () => {
      if (showIdleWarning) return;
      const now = Date.now();
      if (now - lastResetRef.current < 5000) return; // throttle resets
      lastResetRef.current = now;
      startIdleTimers();
    };

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity));
    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearIdleTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, showIdleWarning]);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
      {showIdleWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-xl">
            <h3 className="text-lg font-bold text-navy-900 mb-2">Still there?</h3>
            <p className="text-sm text-navy-900/60 mb-4">
              You've been inactive. You'll be logged out in <span className="font-bold text-red-500">{secondsLeft}s</span> for security.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={forceIdleLogout} className="btn-outline">Log Out Now</button>
              <button onClick={stayLoggedIn} className="btn-primary">Stay Logged In</button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
