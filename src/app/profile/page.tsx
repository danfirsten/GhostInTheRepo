import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile, getProfileStats, calculateGhostLevel } from "@/lib/db/queries";
import { ProfileHeader } from "@/components/profile/ProfileHeader/ProfileHeader";
import { StatsGrid } from "@/components/profile/StatsGrid/StatsGrid";
import { DomainProgress } from "@/components/profile/DomainProgress/DomainProgress";
import styles from "./profile.module.css";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const profile = await getUserProfile();
  const stats = await getProfileStats();

  if (!profile) {
    redirect("/auth/login");
  }

  const totalContent = stats.totalTopics + stats.totalCheatsheets + stats.totalPaths;
  const completedContent =
    stats.topicsCompleted + stats.cheatsheetsViewed + stats.pathsStarted;
  const densityPct =
    totalContent > 0 ? Math.round((completedContent / totalContent) * 100) : 0;
  const ghostLevel = calculateGhostLevel(densityPct);

  return (
    <div className={styles.page}>
      <ProfileHeader
        displayName={profile.display_name ?? "Anonymous Ghost"}
        username={profile.username ?? "ghost"}
        avatarUrl={profile.avatar_url}
        ghostLevel={ghostLevel}
        spectralDensity={densityPct}
      />

      <StatsGrid
        topicsCompleted={stats.topicsCompleted}
        totalTopics={stats.totalTopics}
        cheatsheetsViewed={stats.cheatsheetsViewed}
        totalCheatsheets={stats.totalCheatsheets}
        pathsStarted={stats.pathsStarted}
        totalPaths={stats.totalPaths}
        currentStreak={stats.currentStreak}
      />

      <DomainProgress domains={stats.domainProgress} />
    </div>
  );
}
