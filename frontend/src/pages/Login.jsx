import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Mail, Lock, Loader2, ShieldCheck, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSchoolProfile } from "../context/SchoolProfileContext";
import api from "../api/axios";

export default function Login() {
  const { login } = useAuth();
  const { profile } = useSchoolProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const idleLogout = location.state?.reason === "idle";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [requires2FA, setRequires2FA] = useState(false);
  const [preAuthToken, setPreAuthToken] = useState("");
  const [otp, setOtp] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        localStorage.setItem("erp_user", JSON.stringify(res.data.user));
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/2fa/login-verify", { preAuthToken, token: otp });
      localStorage.setItem("erp_token", res.data.token);
      localStorage.setItem("erp_user", JSON.stringify(res.data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex page-bg">
      <div className="hidden lg:flex w-1/2 bg-navy-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-brand-500/20 rounded-full" />
        <div className="absolute right-10 top-10 w-40 h-40 bg-brand-500/10 rounded-full" />
        <div className="flex items-center gap-2 relative z-10">
          {profile?.logo_base64 ? (
            <img src={profile.logo_base64} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center font-bold">
              {profile?.school_name?.[0] || "S"}
            </div>
          )}
          <span className="font-bold text-lg">{profile?.school_name || "School ERP"}</span>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
            SCHOOL <span className="text-brand-400">ERP</span><br />SOFTWARE
          </h1>
          <p className="mt-4 text-white/70 max-w-md">
            {profile?.tagline || "Manage your school & college management from anywhere in the world."}
          </p>
        </div>
        <div className="relative z-10 flex gap-8 text-sm text-white/60">
          <div><div className="font-bold text-white text-lg">1,250+</div>Students</div>
          <div><div className="font-bold text-white text-lg">85+</div>Teachers</div>
          <div><div className="font-bold text-white text-lg">95%</div>Attendance</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white">
              {profile?.school_name?.[0] || "S"}
            </div>
            <span className="font-bold text-lg text-navy-900">{profile?.school_name || "School ERP"}</span>
          </div>

          {!requires2FA ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <GraduationCap size={24} />
              </div>
              <h2 className="text-2xl font-bold text-navy-900">Welcome back</h2>
              <p className="text-navy-900/50 text-sm mt-1 mb-6">
                Login to your Admin, Management, Teacher or Student account.
              </p>

              {error && <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40" />
                    <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@school.com" className="form-input pl-9" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-900/40" />
                    <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" className="form-input pl-9" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="text-sm text-navy-900/60 mt-6 text-center">
                Don't have an account? <Link to="/signup" className="text-brand-600 font-semibold hover:underline">Sign up</Link>
              </p>
              <p className="text-sm text-navy-900/60 mt-2 text-center">
                Prospective student? <Link to="/admissions" className="text-brand-600 font-semibold hover:underline">Apply for admission</Link>
              </p>

              <div className="mt-8 text-xs text-navy-900/40 border-t border-[#eef0f4] pt-4">
                Demo admin: <b>admin@school.com</b> / <b>Admin@123</b> (created via <code>npm run seed</code>)
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-bold text-navy-900">Two-Factor Authentication</h2>
              <p className="text-navy-900/50 text-sm mt-1 mb-6">Enter the 6-digit code from your authenticator app.</p>

              {error && <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">{error}</div>}

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="form-input text-center text-2xl tracking-[0.5em] font-bold"
                  autoFocus
                />
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                  {loading ? "Verifying..." : "Verify & Sign In"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
