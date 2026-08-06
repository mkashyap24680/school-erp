import { useState } from "react";
import { Save, User, ShieldCheck, Palette, Globe } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useSchoolProfile } from "../context/SchoolProfileContext";

export default function Settings() {
  const { user } = useAuth();
  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 max-w-lg">
        <ProfileSection />
        <LanguageSection />
        <TwoFactorSection />
        {user?.role === "admin" && <BrandingSection />}
      </div>
    </DashboardLayout>
  );
}

function ProfileSection() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const payload = { ...form };
      if (password) payload.password = password;
      await api.put("/auth/me", payload);
      setMessage("Profile updated successfully.");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally { setSaving(false); }
  };

  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4"><User size={22} /></div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">Profile Settings</h2>
      <p className="text-sm text-navy-900/50 mb-6">Update your account details.</p>

      {message && <div className="mb-4 text-sm bg-brand-100 text-brand-600 rounded-lg px-3 py-2">{message}</div>}
      {error && <div className="mb-4 text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="form-label">Full name</label><input name="name" value={form.name} onChange={handleChange} className="form-input" /></div>
        <div><label className="form-label">Email</label><input value={user?.email} disabled className="form-input opacity-60" /></div>
        <div><label className="form-label">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className="form-input" /></div>
        <div><label className="form-label">New password (optional)</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="Leave blank to keep current password" /></div>
        <button type="submit" disabled={saving} className="btn-primary"><Save size={16} /> {saving ? "Saving..." : "Save Changes"}</button>
      </form>
    </div>
  );
}

function LanguageSection() {
  const { lang, setLanguage } = useLanguage();
  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4"><Globe size={22} /></div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">Language</h2>
      <p className="text-sm text-navy-900/50 mb-4">Choose the interface language (sidebar & menus).</p>
      <div className="flex gap-2">
        <button onClick={() => setLanguage("en")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${lang === "en" ? "bg-navy-900 text-white" : "bg-[#f0f2f5] text-navy-900/60"}`}>English</button>
        <button onClick={() => setLanguage("hi")} className={`px-4 py-2 rounded-lg text-sm font-semibold ${lang === "hi" ? "bg-navy-900 text-white" : "bg-[#f0f2f5] text-navy-900/60"}`}>हिन्दी</button>
      </div>
    </div>
  );
}

function TwoFactorSection() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(user?.two_factor_enabled || false);
  const [qr, setQr] = useState(null);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const startSetup = async () => {
    setError(""); setMessage("");
    const res = await api.post("/auth/2fa/setup");
    setQr(res.data.qrDataUrl);
  };

  const confirmEnable = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    try {
      await api.post("/auth/2fa/enable", { token: otp });
      setEnabled(true);
      setQr(null);
      setOtp("");
      setMessage("Two-factor authentication enabled.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid code.");
    }
  };

  const disable = async () => {
    if (!window.confirm("Disable two-factor authentication?")) return;
    await api.post("/auth/2fa/disable");
    setEnabled(false);
    setMessage("Two-factor authentication disabled.");
  };

  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4"><ShieldCheck size={22} /></div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">Two-Factor Authentication</h2>
      <p className="text-sm text-navy-900/50 mb-4">Add an extra layer of security using an authenticator app (Google Authenticator, Authy, etc.).</p>

      {message && <div className="mb-4 text-sm bg-brand-100 text-brand-600 rounded-lg px-3 py-2">{message}</div>}
      {error && <div className="mb-4 text-sm bg-red-50 text-red-600 rounded-lg px-3 py-2">{error}</div>}

      {enabled ? (
        <div className="flex items-center justify-between">
          <span className="badge badge-green">Enabled</span>
          <button onClick={disable} className="btn-outline text-sm">Disable 2FA</button>
        </div>
      ) : qr ? (
        <form onSubmit={confirmEnable} className="space-y-3">
          <p className="text-xs text-navy-900/50">Scan this QR code with your authenticator app, then enter the 6-digit code.</p>
          <img src={qr} alt="2FA QR Code" className="w-40 h-40 mx-auto" />
          <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" maxLength={6} className="form-input text-center tracking-[0.5em] font-bold" />
          <button type="submit" className="btn-primary w-full justify-center">Confirm & Enable</button>
        </form>
      ) : (
        <button onClick={startSetup} className="btn-primary">Set Up Two-Factor Authentication</button>
      )}
    </div>
  );
}

function BrandingSection() {
  const { profile, reload } = useSchoolProfile();
  const [form, setForm] = useState({ school_name: profile?.school_name || "", tagline: profile?.tagline || "", primary_color: profile?.primary_color || "#2f9e44" });
  const [logoPreview, setLogoPreview] = useState(profile?.logo_base64 || null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => setLogoPreview(evt.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage("");
    try {
      await api.put("/school-profile", { ...form, logo_base64: logoPreview });
      reload();
      setMessage("Branding updated successfully.");
    } finally { setSaving(false); }
  };

  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4"><Palette size={22} /></div>
      <h2 className="text-lg font-bold text-navy-900 mb-1">School Branding</h2>
      <p className="text-sm text-navy-900/50 mb-4">Customize the name and logo shown across the app, login page and PDFs.</p>

      {message && <div className="mb-4 text-sm bg-brand-100 text-brand-600 rounded-lg px-3 py-2">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="form-label">School name</label><input value={form.school_name} onChange={(e) => setForm({ ...form, school_name: e.target.value })} className="form-input" /></div>
        <div><label className="form-label">Tagline</label><input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="form-input" /></div>
        <div>
          <label className="form-label">Logo</label>
          <div className="flex items-center gap-3">
            {logoPreview && <img src={logoPreview} alt="Logo preview" className="w-12 h-12 rounded-lg object-cover" />}
            <input type="file" accept="image/*" onChange={handleLogoChange} className="text-sm" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary"><Save size={16} /> {saving ? "Saving..." : "Save Branding"}</button>
      </form>
    </div>
  );
}
