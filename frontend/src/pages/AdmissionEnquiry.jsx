import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, CheckCircle2 } from "lucide-react";
import { useSchoolProfile } from "../context/SchoolProfileContext";
import api from "../api/axios";

const emptyForm = { name: "", email: "", phone: "", class_applying: "", message: "" };

export default function AdmissionEnquiry() {
  const { profile } = useSchoolProfile();
  const [form, setForm] = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/enquiries", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen page-bg flex items-center justify-center p-6">
      <div className="w-full max-w-lg card p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white">
            {profile?.school_name?.[0] || "S"}
          </div>
          <span className="font-bold text-lg text-navy-900">{profile?.school_name || "School ERP"}</span>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <CheckCircle2 size={48} className="text-brand-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-navy-900 mb-2">Thank you!</h2>
            <p className="text-navy-900/60 text-sm mb-6">Your enquiry has been submitted. Our admissions team will contact you soon.</p>
            <Link to="/login" className="btn-outline inline-flex">Back to Login</Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-navy-900 mb-1">Admission Enquiry</h2>
            <p className="text-navy-900/50 text-sm mb-6">Interested in joining us? Fill this form and we'll reach out.</p>

            {error && <div className="mb-4 text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="form-label">Student's full name</label><input name="name" required value={form.name} onChange={handleChange} className="form-input" /></div>
              <div><label className="form-label">Parent/guardian email</label><input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" /></div>
              <div><label className="form-label">Phone number</label><input name="phone" required value={form.phone} onChange={handleChange} className="form-input" /></div>
              <div><label className="form-label">Class applying for</label><input name="class_applying" value={form.class_applying} onChange={handleChange} placeholder="e.g. Grade 5" className="form-input" /></div>
              <div><label className="form-label">Message (optional)</label><textarea rows={3} name="message" value={form.message} onChange={handleChange} className="form-input" /></div>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-2.5">
                <Send size={16} /> {saving ? "Submitting..." : "Submit Enquiry"}
              </button>
            </form>

            <p className="text-sm text-navy-900/60 mt-6 text-center">
              Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
