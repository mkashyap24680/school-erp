```jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  Info,
  Eye,
  EyeOff,
} from "lucide-react";
import { useSchoolProfile } from "../context/SchoolProfileContext";
import api from "../api/axios";

export default function Login() {
  const { profile } = useSchoolProfile();
  const location = useLocation();

  const idleLogout = location.state?.reason === "idle";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [requires2FA, setRequires2FA] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState("");
  const [otp, setOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

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
        localStorage.setItem("erp_token", res.data.token);
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

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/2fa/login-verify", {
        preAuthToken,
        token: otp,
      });

      localStorage.setItem("erp_token", res.data.token);
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
    <div className="min-h-screen flex bg-white">

      {/* Left Banner Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-transparent" />

        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full">

          <div className="flex items-center gap-3 mb-8">

            {profile?.logo_base64 ? (
              <img
                src={profile.logo_base64}
                alt={profile?.school_name || "School Logo"}
                className="w-14 h-14 rounded-xl object-cover bg-white"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-brand-500 flex items-center justify-center text-xl font-bold">
                {profile?.school_name?.[0] || "S"}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold">
                {profile?.school_name || "School ERP"}
              </h1>

              <p className="text-white/50 text-xs tracking-widest mt-1">
                SCHOOL ERP SOFTWARE
              </p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold leading-tight max-w-xl">
            {profile?.tagline ||
              "Manage your school & college management from anywhere in the world."}
          </h2>

          <div className="flex gap-8 mt-10">

            <div>
              <div className="text-2xl font-bold">
                1,250+
              </div>
              <div className="text-white/50 text-sm">
                Students
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold">
                85+
              </div>
              <div className="text-white/50 text-sm">
                Teachers
              </div>
            </div>

            <div>
              <div className="text-2xl font-bold">
                95%
              </div>
              <div className="text-white/50 text-sm">
                Attendance
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Login Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-md">

          {/* Mobile Header */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">

            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white">
              {profile?.school_name?.[0] || "S"}
            </div>

            <span className="font-bold text-lg text-navy-900">
              {profile?.school_name || "School ERP"}
            </span>

          </div>

          {!requires2FA ? (
            <>
              {/* Login Header */}
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>

              <h2 className="text-2xl font-bold text-navy-900">
                Welcome back
              </h2>

              <p className="text-navy-900/50 text-sm mt-1 mb-6">
                Login to your Admin, Management, Teacher or Student account.
              </p>

              {/* Idle Logout Message */}
              {idleLogout && (
                <div className="mb-4 text-sm bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-2 flex items-center gap-2">
                  <Info size={16} />
                  <span>
                    You were logged out due to inactivity. Please sign in again.
                  </span>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >

                {/* Email */}
                <div>
                  <label className="form-label">
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40 pointer-events-none"
                    />

                    <input
                      type="email"
                      name="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@school.com"
                      className="form-input w-full pl-11 pr-4"
                    />

                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="form-label">
                    Password
                  </label>

                  <div className="relative">

                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40 pointer-events-none"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="form-input w-full pl-11 pr-11"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-900/40 hover:text-navy-900 transition-colors"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>
                </div>

                {/* Login Button */}
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
              <p className="text-sm text-navy-900/60 mt-6 text-center">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Sign up
                </Link>
              </p>

              {/* Admissions */}
              <p className="text-sm text-navy-900/60 mt-2 text-center">
                Prospective student?{" "}
                <Link
                  to="/admissions"
                  className="text-brand-600 font-semibold hover:underline"
                >
                  Apply for admission
                </Link>
              </p>

              {/* Demo Credentials */}
              <div className="mt-8 text-xs text-navy-900/40 border-t border-[#eef0f4] pt-4">
                Demo admin: <b>admin@school.com</b> /{" "}
                <b>Admin@123</b> (created via{" "}
                <code>npm run seed</code>)
              </div>
            </>
          ) : (
            <>
              {/* 2FA Header */}
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>

              <h2 className="text-2xl font-bold text-navy-900">
                Two-Factor Authentication
              </h2>

              <p className="text-navy-900/50 text-sm mt-1 mb-6">
                Enter the 6-digit code from your authenticator app.
              </p>

              {/* 2FA Error */}
              {error && (
                <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {/* 2FA Form */}
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
                  className="form-input w-full text-center text-2xl tracking-[0.5em] font-bold"
                  autoFocus
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center py-2.5"
                >
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
