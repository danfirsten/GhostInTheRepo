import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllDomains, getTopicsForDomain } from "@/lib/data";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch progress and visits
  const [progressRes, visitsRes] = await Promise.all([
    supabase.from("user_progress").select("*").eq("user_id", user.id),
    supabase
      .from("user_daily_visits")
      .select("visit_date")
      .eq("user_id", user.id)
      .order("visit_date", { ascending: true }),
  ]);

  const progress = progressRes.data ?? [];
  const visits = (visitsRes.data ?? []).map(
    (v: { visit_date: string }) => v.visit_date
  );
  const domains = getAllDomains();

  // Build domain stats
  const domainStats = domains.map((d) => {
    const topics = getTopicsForDomain(d.slug);
    const completed = progress.filter(
      (p) =>
        p.content_type === "topic" &&
        p.domain_slug === d.slug &&
        p.progress_pct >= 100
    ).length;
    const lastActivity =
      progress
        .filter((p) => p.domain_slug === d.slug)
        .sort(
          (a: { updated_at: string }, b: { updated_at: string }) =>
            new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )[0]?.updated_at ?? null;
    return {
      slug: d.slug,
      label: d.label,
      total: topics.length,
      completed,
      percentage:
        topics.length > 0 ? Math.round((completed / topics.length) * 100) : 0,
      lastActivity,
    };
  });

  // Weekly velocity (topics completed per week over last 12 weeks)
  const now = new Date();
  const velocity: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7 + now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const count = progress.filter((p) => {
      if (p.content_type !== "topic" || p.progress_pct < 100 || !p.completed_at)
        return false;
      const d = new Date(p.completed_at);
      return d >= weekStart && d < weekEnd;
    }).length;
    velocity.push({
      week: weekStart.toISOString().slice(0, 10),
      count,
    });
  }

  // Suggested next reads (domains with lowest completion, pick uncompleted topics)
  const suggestions = domainStats
    .filter((d) => d.completed < d.total)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map((d) => {
      const topics = getTopicsForDomain(d.slug);
      const completedSlugs = new Set(
        progress
          .filter(
            (p) =>
              p.content_type === "topic" &&
              p.domain_slug === d.slug &&
              p.progress_pct >= 100
          )
          .map((p) => p.content_slug)
      );
      const nextTopic = topics.find((t) => !completedSlugs.has(t.slug));
      return {
        domainSlug: d.slug,
        domainLabel: d.label,
        topicSlug: nextTopic?.slug ?? topics[0]?.slug,
        topicTitle: nextTopic?.title ?? topics[0]?.title ?? d.label,
        domainPercentage: d.percentage,
      };
    });

  return NextResponse.json({
    domainStats,
    visits,
    velocity,
    suggestions,
  });
}
