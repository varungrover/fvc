"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
};

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSaved(false);
    setProfileLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", profile.id);

    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSaved(true);
    }
    setProfileLoading(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <form onSubmit={handleProfileSave} className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-white">Profile Information</h2>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
          <input
            type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <input
            type="email" value={profile.email} disabled
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark/50 text-slate-500 cursor-not-allowed"
          />
          <p className="text-xs text-slate-600 mt-1">Email cannot be changed here. Contact support.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone <span className="text-slate-500">(optional)</span></label>
          <input
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 604 000 0000"
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
          <div className="flex items-center gap-2 px-3 py-3 bg-surface-dark/50 border border-border-dark rounded-lg">
            <span className="material-icons-round text-[18px] text-slate-500">badge</span>
            <span className="text-slate-400 text-sm capitalize">{profile.role.replace("_", " ")}</span>
          </div>
        </div>

        {profileError && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">{profileError}</div>
        )}
        {profileSaved && (
          <div className="bg-success/10 border border-success/30 rounded-lg px-4 py-3 text-success text-sm flex items-center gap-2">
            <span className="material-icons-round text-[16px]">check_circle</span>
            Profile updated successfully.
          </div>
        )}

        <button
          type="submit" disabled={profileLoading}
          className="bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-5 rounded-lg shadow-[0_0_10px_rgba(43,108,238,0.2)] transition-all duration-200 text-sm"
        >
          {profileLoading ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* Change Password */}
      <form onSubmit={handlePasswordChange} className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-bold text-white">Change Password</h2>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
          <input
            type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm new password</label>
          <input
            type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {passwordError && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">{passwordError}</div>
        )}
        {passwordSaved && (
          <div className="bg-success/10 border border-success/30 rounded-lg px-4 py-3 text-success text-sm flex items-center gap-2">
            <span className="material-icons-round text-[16px]">check_circle</span>
            Password updated successfully.
          </div>
        )}

        <button
          type="submit" disabled={passwordLoading}
          className="bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-5 rounded-lg shadow-[0_0_10px_rgba(43,108,238,0.2)] transition-all duration-200 text-sm"
        >
          {passwordLoading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
