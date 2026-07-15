"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { User, Mail, Phone, Loader2, Check, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const user = session?.user as { id?: string; name?: string; email?: string; phone?: string; image?: string; role?: string } | undefined;

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (!res.ok) { setError("Failed to save changes."); return; }
      await update({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6" style={{ fontFamily: "var(--font-jakarta)" }}>
        My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card p-6 text-center">
          <div className="w-20 h-20 bg-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold">
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <p className="font-bold text-[#111827]">{user?.name}</p>
          <p className="text-sm text-[#6B7280]">{user?.email}</p>
          {user?.role && (
            <span className={`badge mt-2 ${user.role === "ADMIN" ? "badge-purple" : "badge-gray"}`}>
              {user.role}
            </span>
          )}
        </div>

        {/* Edit form */}
        <div className="md:col-span-2 card p-6">
          <h2 className="font-bold text-[#111827] mb-5" style={{ fontFamily: "var(--font-jakarta)" }}>
            Edit Profile
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label" htmlFor="profile-name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  id="profile-name" type="text" value={name}
                  onChange={e => setName(e.target.value)} className="input pl-10"
                  placeholder="Your name" required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="profile-email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  id="profile-email" type="email" value={user?.email ?? ""}
                  className="input pl-10 bg-[#F9FAFB] cursor-not-allowed opacity-70" disabled
                />
              </div>
              <p className="text-xs text-[#9CA3AF] mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="label" htmlFor="profile-phone">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  id="profile-phone" type="tel" value={phone}
                  onChange={e => setPhone(e.target.value)} className="input pl-10"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
