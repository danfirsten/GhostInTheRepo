"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/db/types";
import styles from "./SettingsForm.module.css";

interface SettingsFormProps {
  profile: UserProfile;
  email: string;
  provider: string;
}

export function SettingsForm({ profile, email, provider }: SettingsFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        display_name: displayName,
        username,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? "That username is already taken."
          : updateError.message
      );
    } else {
      setSuccess(true);
      router.refresh();
    }

    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordMsg("Password updated successfully.");
      setNewPassword("");
    }
  };

  return (
    <div className={styles.container}>
      {/* Profile Settings */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Profile</h2>
        <form onSubmit={handleSaveProfile} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="displayName" className={styles.label}>
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={styles.input}
              maxLength={50}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              title="Letters, numbers, hyphens, and underscores only"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="bio" className={styles.label}>
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.textarea}
              rows={3}
              maxLength={200}
              placeholder="Tell us about yourself..."
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>Profile updated.</p>}

          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* Account Info */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Email</span>
          <span className={styles.infoValue}>{email}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Sign-in method</span>
          <span className={styles.infoValue}>
            {provider === "email" ? "Email & Password" : `Google`}
          </span>
        </div>
      </section>

      {/* Password Change — only for email users */}
      {provider === "email" && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Change Password</h2>
          <form onSubmit={handleChangePassword} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="newPassword" className={styles.label}>
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.input}
                minLength={6}
                autoComplete="new-password"
              />
            </div>

            {passwordError && <p className={styles.error}>{passwordError}</p>}
            {passwordMsg && <p className={styles.success}>{passwordMsg}</p>}

            <button type="submit" className={styles.saveBtn}>
              Update Password
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
