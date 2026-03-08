import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/db/queries";
import { SettingsForm } from "@/components/profile/SettingsForm/SettingsForm";
import styles from "../profile.module.css";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  // Determine auth provider
  const provider = user.app_metadata?.provider ?? "email";

  return (
    <div className={styles.page}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem",
          fontWeight: 700,
          color: "var(--ghost-white)",
          margin: 0,
        }}
      >
        Settings
      </h1>
      <SettingsForm
        profile={profile}
        email={user.email ?? ""}
        provider={provider}
      />
    </div>
  );
}
