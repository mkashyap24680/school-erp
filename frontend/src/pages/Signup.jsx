import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center page-bg p-6">
      <div className="w-full max-w-md card p-8">
        <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
          <UserPlus size={24} />
        </div>
        <h2 className="text-2xl font-bold text-navy-900">Create your account</h2>
        <p className="text-navy-900/50 text-sm mt-1 mb-6">
          Sign up as a Student or Teacher. Admin &amp; Management accounts are created by
          your school administrator.
        </p>

        {error && (
          <div className="mb-4 text-sm bg-red-50 text-red-600 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full name</label>
            <input
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Email address</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@school.com"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">I am a</label>
            <select name="role" value={form.role} onChange={handleChange} className="form-input">
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent / Guardian</option>
            </select>
          </div>
          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-navy-900/60 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
