```jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSchoolProfile } from "../context/SchoolProfileContext";
import api from "../api/axios";

export default function Login() {
  const { login } = useAuth();
  const { profile } = useSchoolProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const idleLogout = location.state?.reason === "idle";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // 2FA
  const [requires2FA, setRequires2FA] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState("");
  const [otp, setOtp] = useState("");

  // ---------------------------------------
  // Form change
  // ---------------------------------------

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------------------------------
  // Login
  // ---------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);

      if (res.data.requires2FA) {
        setRequires2FA(true);
        setPreAuthToken(res.data.preAuthToken);
      } else {
        localStorage.setItem(
          "erp_token",
          res.data.token
        );

        localStorage.setItem(
          "erp_user",
          JSON.stringify(res.data.user)
        );

        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // 2FA verification
  // ---------------------------------------

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await api.post(
        "/auth/2fa/login-verify",
        {
          preAuthToken,
          token: otp,
        }
      );

      localStorage.setItem(
        "erp_token",
        res.data.token
      );

      localStorage.setItem(
        "erp_user",
        JSON.stringify(res.data.user)
      );

      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0b1226]">

      {/* =====================================================
          LEFT BANNER SECTION
          ===================================================== */}

      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950" />

        <div className="relative z-10 flex flex-col justify-center w-full p-12 xl:p-16">

          {/* School Logo */}
          <div className="flex items-center gap-3 mb-8">
            {profile?.logo_base64 ? (
              <img
                src={profile.logo_base64}
                alt={profile?.school_name || "School"}
                className="w-14 h-14 rounded-xl object-cover bg-white"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-500 flex items-center justify-center text-xl font-bold">
                {profile?.school_name?.[0] || "S"}
              </div>
            )}

            <div>
              <div className="text-xl font-bold">
                {profile?.school_name || "School ERP"}
              </div>

              <div className="text-xs text-white/50 uppercase tracking-widest mt-0.5">
                SCHOOL ERP SOFTWARE
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight max-w-xl">
            {profile?.tagline ||
              "Manage your school & college management from anywhere in the world."}
          </h1>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg">

            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <div className="text-2xl font-bold">
                1,250+
              </div>

              <div className="text-sm text-white/50 mt-1">
                Students
              </div>
            </div>

            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <div className="text-2xl font-bold">
                85+
              </div>

              <div className="text-sm text-white/50 mt-1">
                Teachers
              </div>
            </div>

            <div className="rounded-xl bg-white/10 border border-white/10 p-4">
              <div className="text-2xl font-bold">
                95%
              </div>

              <div className="text-sm text-white/50 mt-1">
                Attendance
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          RIGHT LOGIN FORM SECTION
          ===================================================== */}

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white">
              {profile?.school_name?.[0] || "S"}
            </div>

            <span className="font-bold text-lg text-navy-900 dark:text-white">
              {profile?.school_name || "School ERP"}
            </span>
          </div>

          {/* =================================================
              NORMAL LOGIN
              ================================================= */}

          {!requires2FA ? (
            <>
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>

              {/* Heading */}
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white">
                Welcome back
              </h2>

              <p className="text-navy-900/50 dark:text-white/50 text-sm mt-1 mb-6">
                Login to your Admin, Management,
                Teacher or Student account.
              </p>

              {/* Idle Logout Message */}
              {idleLogout && (
                <div className="mb-4 text-sm bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Info size={16} />

                  <span>
                    You were logged out due to inactivity.
                    Please sign in again.
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* ===============================
                    EMAIL
                    =============================== */}

                <div>
                  <label className="form-label">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40 dark:text-white/40 pointer-events-none z-10"
                    />

                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@school.com"
                      autoComplete="email"
                      className="form-input pl-11"
                    />

                  </div>
                </div>

                {/* ===============================
                    PASSWORD
                    =============================== */}

                <div>
                  <label className="form-label">
                    Password
                  </label>

                  <div className="relative">

                    {/* Lock Icon */}
                    <Lock
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40 dark:text-white/40 pointer-events-none z-10"
                    />

                    {/* Password Input */}
                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className="form-input pl-11 pr-11"
                    />

                    {/* Show / Hide Password */}
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-900/40 hover:text-navy-900 dark:text-white/40 dark:hover:text-white transition-colors p-0.5"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      title={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>
                </div>

                {/* ===============================
                    LOGIN BUTTON
                    =============================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {loading
                    ? "Signing in..."
                    : "Sign In"}
                </button>

              </form>

              {/* Signup */}
              <p className="text-sm text-navy-900/60 dark:text-white/60 mt-6 text-center">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </p>

              {/* Admission */}
              <p className="text-sm text-navy-900/60 dark:text-white/60 mt-2 text-center">
                Prospective student?{" "}
                <Link
                  to="/admissions"
                  className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  Apply for admission
                </Link>
              </p>

              {/* Demo Credentials */}
              <div className="mt-8 text-xs text-navy-900/40 dark:text-white/40 border-t border-[#eef0f4] dark:border-white/10 pt-4">
                Demo admin:{" "}
                <b>admin@school.com</b> /{" "}
                <b>Admin@123</b>{" "}
                (created via{" "}
                <code>npm run seed</code>)
              </div>
            </>
          ) : (

            /* =================================================
               TWO FACTOR AUTHENTICATION
               ================================================= */

            <>
              {/* 2FA Icon */}
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>

              {/* 2FA Heading */}
              <h2 className="text-2xl font-bold text-navy-900 dark:text-white">
                Two-Factor Authentication
              </h2>

              <p className="text-navy-900/50 dark:text-white/50 text-sm mt-1 mb-6">
                Enter the 6-digit code from your
                authenticator app.
              </p>

              {/* Error */}
              {error && (
                <div className="mb-4 text-sm bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* OTP Form */}
              <form
                onSubmit={handleOtpSubmit}
                className="space-y-4"
              >

                <input
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value)
                  }
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="form-input text-center text-2xl tracking-[0.5em] font-bold"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
                  {loading && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {loading
                    ? "Verifying..."
                    : "Verify & Sign In"}
                </button>

              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```
