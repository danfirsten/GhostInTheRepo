import { createClient } from "@/lib/supabase/server";
import { getAllDomains, getTopicsForDomain } from "@/lib/data";
import type {
  UserProfile,
  UserProgress,
  ProfileStats,
  DomainProgressEntry,
} from "./types";

/** Fetch the current user's profile */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as UserProfile | null;
}

/** Update the current user's profile */
export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, "username" | "display_name" | "bio" | "avatar_url">>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  return { error: error?.message ?? null };
}

/** Fetch all progress entries for the current user */
export async function getUserProgress(): Promise<UserProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id);

  return (data as UserProgress[]) ?? [];
}

/** Calculate the current visit streak */
export async function getCurrentStreak(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: visits } = await supabase
    .from("user_daily_visits")
    .select("visit_date")
    .eq("user_id", user.id)
    .order("visit_date", { ascending: false })
    .limit(365);

  if (!visits || visits.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < visits.length; i++) {
    const visitDate = new Date(visits[i].visit_date);
    visitDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (visitDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/** Build complete profile stats for the dashboard */
export async function getProfileStats(): Promise<ProfileStats> {
  const progress = await getUserProgress();
  const streak = await getCurrentStreak();
  const domains = getAllDomains();

  const topicsCompleted = progress.filter(
    (p) => p.content_type === "topic" && p.progress_pct === 100
  ).length;

  const cheatsheetsViewed = progress.filter(
    (p) => p.content_type === "cheatsheet" && p.progress_pct === 100
  ).length;

  const pathsStarted = progress.filter(
    (p) => p.content_type === "path"
  ).length;

  // Count total topics across all domains
  let totalTopics = 0;
  const domainProgress: DomainProgressEntry[] = [];

  for (const domain of domains) {
    const topics = getTopicsForDomain(domain.slug);
    const domainTopicCount = topics.length;
    totalTopics += domainTopicCount;

    const completedInDomain = progress.filter(
      (p) =>
        p.content_type === "topic" &&
        p.domain_slug === domain.slug &&
        p.progress_pct === 100
    ).length;

    domainProgress.push({
      domainSlug: domain.slug,
      domainLabel: domain.label,
      completed: completedInDomain,
      total: domainTopicCount,
      percentage: domainTopicCount > 0
        ? Math.round((completedInDomain / domainTopicCount) * 100)
        : 0,
    });
  }

  return {
    topicsCompleted,
    totalTopics,
    cheatsheetsViewed,
    totalCheatsheets: 14,
    pathsStarted,
    totalPaths: 12,
    currentStreak: streak,
    domainProgress,
  };
}

/** Calculate ghost level from spectral density percentage (0-100) */
export function calculateGhostLevel(densityPct: number): number {
  if (densityPct >= 95) return 10;
  if (densityPct >= 85) return 9;
  if (densityPct >= 75) return 8;
  if (densityPct >= 65) return 7;
  if (densityPct >= 55) return 6;
  if (densityPct >= 45) return 5;
  if (densityPct >= 35) return 4;
  if (densityPct >= 20) return 3;
  if (densityPct >= 10) return 2;
  return 1;
}
