import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBadgeUnlocks } from "@/lib/badges/engine";
import type { BadgeCheckContext } from "@/lib/badges/types";

/**
 * POST /api/user/badges/check
 * Evaluates all badge conditions and awards any newly unlocked badges.
 * Returns the list of newly unlocked badge IDs.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Gather context from request body (client sends partial context)
  const body = await request.json();

  // Fetch server-side data
  const [progressRes, badgesRes, visitsRes, profileCountRes] = await Promise.all([
    supabase.from("user_progress").select("*").eq("user_id", user.id),
    supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
    supabase
      .from("user_daily_visits")
      .select("visit_date")
      .eq("user_id", user.id)
      .order("visit_date", { ascending: false })
      .limit(365),
    supabase.from("user_profiles").select("id", { count: "exact", head: true }),
  ]);

  const progress = progressRes.data ?? [];
  const earnedBadgeIds = new Set(
    (badgesRes.data ?? []).map((b: { badge_id: string }) => b.badge_id)
  );

  // Calculate streak
  let currentStreak = 0;
  const visits = visitsRes.data ?? [];
  if (visits.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < visits.length; i++) {
      const visitDate = new Date(visits[i].visit_date);
      visitDate.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(expected.getDate() - i);
      if (visitDate.getTime() === expected.getTime()) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Count by type
  const topicsCompleted = progress.filter(
    (p) => p.content_type === "topic" && p.progress_pct >= 100
  ).length;
  const cheatsheetsViewed = progress.filter(
    (p) => p.content_type === "cheatsheet" && p.progress_pct >= 100
  ).length;
  const codexRead = progress.filter(
    (p) => p.content_type === "codex" && p.progress_pct >= 100
  ).length;
  const pathsCompleted = progress.filter(
    (p) => p.content_type === "path" && p.progress_pct >= 100
  ).length;

  // Unique topics visited
  const uniqueTopicsVisited = new Set(
    progress.filter((p) => p.content_type === "topic").map((p) => p.content_slug)
  ).size;

  // Domains visited (have at least 1 topic)
  const domainsVisited = new Set(
    progress
      .filter((p) => p.content_type === "topic" && p.domain_slug)
      .map((p) => p.domain_slug)
  ).size;

  // Domain completion (from client-provided totals)
  const domainTotals: Record<string, number> = body.domainTotals ?? {};
  const domainCompletion: Record<string, { completed: number; total: number }> = {};
  const domainsFullyCompleted: string[] = [];

  for (const [slug, total] of Object.entries(domainTotals)) {
    const completed = progress.filter(
      (p) =>
        p.domain_slug === slug &&
        p.content_type === "topic" &&
        p.progress_pct >= 100
    ).length;
    domainCompletion[slug] = { completed, total };
    if (total > 0 && completed >= total) {
      domainsFullyCompleted.push(slug);
    }
  }

  // Account number (approximate by total profile count)
  const totalProfiles = profileCountRes.count ?? 999;

  const hour = new Date().getHours();
  const isWitchingHour = body.isWitchingHour ?? (hour >= 0 && hour < 4);

  const ctx: BadgeCheckContext = {
    topicsCompleted,
    cheatsheetsViewed,
    codexRead,
    totalCodex: body.totalCodex ?? 0,
    totalCheatsheets: body.totalCheatsheets ?? 14,
    currentStreak,
    domainsVisited,
    domainsFullyCompleted,
    uniqueTopicsVisited,
    isWitchingHour,
    allDomainHubsVisited: domainsVisited >= 14,
    pathsCompleted,
    accountCreatedAt: user.created_at,
    accountNumber: totalProfiles,
    earnedBadgeIds,
    domainCompletion,
  };

  const newlyUnlocked = checkBadgeUnlocks(ctx);

  // Persist newly unlocked badges
  if (newlyUnlocked.length > 0) {
    const rows = newlyUnlocked.map((badge_id) => ({
      user_id: user.id,
      badge_id,
      earned_at: new Date().toISOString(),
    }));

    await supabase
      .from("user_badges")
      .upsert(rows, { onConflict: "user_id,badge_id" });
  }

  return NextResponse.json({ newlyUnlocked });
}
