"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./dashboard.module.css";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DomainStat {
  slug: string;
  label: string;
  total: number;
  completed: number;
  percentage: number;
  lastActivity: string | null;
}

interface VelocityWeek {
  week: string;
  count: number;
}

interface Suggestion {
  domainSlug: string;
  domainLabel: string;
  topicSlug: string;
  topicTitle: string;
  domainPercentage: number;
}

interface DashboardData {
  domainStats: DomainStat[];
  visits: string[];
  velocity: VelocityWeek[];
  suggestions: Suggestion[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function daysBetween(a: Date, b: Date): number {
  return Math.floor(
    Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24)
  );
}

/** Build a Set of "YYYY-MM-DD" strings from visits array. */
function buildVisitSet(visits: string[]): Set<string> {
  return new Set(visits.map((v) => v.slice(0, 10)));
}

/** Get heat color for a cell given whether visited. */
function heatColor(visited: boolean): string {
  if (!visited) return "rgba(167, 139, 250, 0.05)";
  return "rgba(167, 139, 250, 0.85)";
}

/** Format a date as "YYYY-MM-DD". */
function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function ActivityHeatmap({ visits }: { visits: string[] }) {
  const visitSet = buildVisitSet(visits);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 53 weeks of data ending on today
  const weeks: { date: Date; key: string }[][] = [];
  const endDay = new Date(today);

  // Go back ~365 days to the nearest Sunday
  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - 364);
  // Align to previous Sunday
  startDay.setDate(startDay.getDate() - startDay.getDay());

  let cursor = new Date(startDay);
  let currentWeek: { date: Date; key: string }[] = [];

  while (cursor <= endDay) {
    currentWeek.push({ date: new Date(cursor), key: fmt(cursor) });
    if (cursor.getDay() === 6 || cursor.getTime() === endDay.getTime()) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Compute visit counts per day for intensity
  const visitCounts = new Map<string, number>();
  for (const v of visits) {
    const key = v.slice(0, 10);
    visitCounts.set(key, (visitCounts.get(key) ?? 0) + 1);
  }

  function cellColor(key: string): string {
    const count = visitCounts.get(key) ?? 0;
    if (count === 0) return "rgba(167, 139, 250, 0.05)";
    if (count === 1) return "rgba(167, 139, 250, 0.25)";
    if (count <= 3) return "rgba(167, 139, 250, 0.5)";
    return "rgba(167, 139, 250, 0.85)";
  }

  // Build month labels positioned at the correct week
  const monthMarkers: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    if (firstDay) {
      const m = firstDay.date.getMonth();
      if (m !== lastMonth) {
        monthMarkers.push({ label: MONTH_LABELS[m], weekIndex: wi });
        lastMonth = m;
      }
    }
  });

  const cellSize = 11;
  const gap = 2;
  const weekWidth = cellSize + gap;
  const totalWidth = weeks.length * weekWidth;

  return (
    <div className={styles.heatmap}>
      <div
        className={styles.heatmapMonths}
        style={{ width: totalWidth + 28, paddingLeft: 28 }}
      >
        {monthMarkers.map((m, i) => (
          <span
            key={i}
            className={styles.heatmapMonth}
            style={{
              position: "absolute",
              left: 28 + m.weekIndex * weekWidth,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div
        className={styles.heatmapMonths}
        style={{ position: "relative", height: 16, marginBottom: 4 }}
      >
        {monthMarkers.map((m, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: 28 + m.weekIndex * weekWidth,
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              color: "var(--text-tertiary)",
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className={styles.heatmapBody}>
        <div className={styles.heatmapDayLabels}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className={styles.heatmapDayLabel}
              style={{ visibility: i % 2 === 0 ? "hidden" : "visible" }}
            >
              {label}
            </div>
          ))}
        </div>
        <div className={styles.heatmapWeeks}>
          {weeks.map((week, wi) => (
            <div key={wi} className={styles.heatmapWeek}>
              {/* Pad the first week if it doesn't start on Sunday */}
              {wi === 0 &&
                week[0] &&
                Array.from({ length: week[0].date.getDay() }).map((_, pi) => (
                  <div
                    key={`pad-${pi}`}
                    className={styles.heatmapCell}
                    style={{ background: "transparent" }}
                  />
                ))}
              {week.map((day) => (
                <div
                  key={day.key}
                  className={styles.heatmapCell}
                  style={{ background: cellColor(day.key) }}
                  title={`${day.key}: ${visitCounts.get(day.key) ?? 0} visit(s)`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DomainRadar({ domains }: { domains: DomainStat[] }) {
  if (domains.length === 0) return null;

  const cx = 200;
  const cy = 200;
  const maxR = 140;
  const labelR = maxR + 28;
  const n = domains.length;
  const angleStep = (2 * Math.PI) / n;
  // Start from top (-PI/2)
  const startAngle = -Math.PI / 2;

  function polarToXY(
    angle: number,
    radius: number
  ): { x: number; y: number } {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  // Concentric rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data polygon points
  const dataPoints = domains.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const r = (d.percentage / 100) * maxR;
    return polarToXY(angle, Math.max(r, 2));
  });
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") +
    " Z";

  // Axis lines
  const axes = domains.map((_, i) => {
    const angle = startAngle + i * angleStep;
    const end = polarToXY(angle, maxR);
    return { x1: cx, y1: cy, x2: end.x, y2: end.y };
  });

  // Labels
  const labels = domains.map((d, i) => {
    const angle = startAngle + i * angleStep;
    const pos = polarToXY(angle, labelR);
    let anchor: "start" | "middle" | "end" = "middle";
    if (pos.x < cx - 10) anchor = "end";
    else if (pos.x > cx + 10) anchor = "start";
    return { ...pos, label: d.label, pct: d.percentage, anchor };
  });

  return (
    <div className={styles.radarChart}>
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        {/* Concentric rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={domains
              .map((_, i) => {
                const angle = startAngle + i * angleStep;
                const p = polarToXY(angle, maxR * r);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            fill="none"
            stroke="var(--border-ghost)"
            strokeWidth={0.5}
            opacity={0.6}
          />
        ))}

        {/* Axis lines */}
        {axes.map((a, i) => (
          <line
            key={i}
            x1={a.x1}
            y1={a.y1}
            x2={a.x2}
            y2={a.y2}
            stroke="var(--border-ghost)"
            strokeWidth={0.5}
            opacity={0.4}
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={dataPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(167, 139, 250, 0.15)"
          stroke="var(--spectral-1)"
          strokeWidth={1.5}
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="var(--spectral-1)"
          />
        ))}

        {/* Labels */}
        {labels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor}
            dominantBaseline="central"
            fill="var(--text-secondary)"
            fontSize={9}
            fontFamily="var(--font-ui)"
          >
            {l.label.length > 14 ? l.label.slice(0, 12) + ".." : l.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function StaleKnowledgeWarnings({ domains }: { domains: DomainStat[] }) {
  const now = new Date();
  const stale = domains
    .filter((d) => {
      if (!d.lastActivity) return false;
      return daysBetween(now, new Date(d.lastActivity)) > 30;
    })
    .map((d) => ({
      ...d,
      daysSince: daysBetween(now, new Date(d.lastActivity!)),
    }))
    .sort((a, b) => b.daysSince - a.daysSince);

  return (
    <div className={styles.staleSection}>
      <h3 className={styles.sectionHeading}>Stale Knowledge Warnings</h3>
      {stale.length === 0 ? (
        <p className={styles.staleEmpty}>
          No stale domains -- you have been active across all areas recently.
        </p>
      ) : (
        <div className={styles.staleList}>
          {stale.map((d) => (
            <div key={d.slug} className={styles.staleItem}>
              <span className={styles.staleIcon} aria-hidden="true">
                &#9888;
              </span>
              <div className={styles.staleInfo}>
                <div className={styles.staleDomain}>{d.label}</div>
                <div className={styles.staleDays}>
                  {d.daysSince} days since last activity
                </div>
              </div>
              <a
                href={`/topics/${d.slug}`}
                className={styles.staleLink}
              >
                Continue &rarr;
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LearningVelocity({ velocity }: { velocity: VelocityWeek[] }) {
  const maxCount = Math.max(...velocity.map((v) => v.count), 1);
  const barWidth = 40;
  const gap = 8;
  const chartHeight = 160;
  const labelHeight = 40;
  const totalWidth = velocity.length * (barWidth + gap) - gap;
  const svgHeight = chartHeight + labelHeight;

  return (
    <div className={styles.velocityChart}>
      <svg
        viewBox={`0 0 ${totalWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Bars */}
        {velocity.map((v, i) => {
          const barH = maxCount > 0 ? (v.count / maxCount) * (chartHeight - 20) : 0;
          const x = i * (barWidth + gap);
          const y = chartHeight - barH;
          return (
            <g key={v.week}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barH, 2)}
                rx={3}
                fill={v.count > 0 ? "var(--spectral-3)" : "var(--border-ghost)"}
                opacity={v.count > 0 ? 0.8 : 0.3}
              />
              {v.count > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  fontFamily="var(--font-mono)"
                >
                  {v.count}
                </text>
              )}
              {/* Week label - show every other week */}
              {i % 2 === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fill="var(--text-tertiary)"
                  fontSize={8}
                  fontFamily="var(--font-mono)"
                >
                  {v.week.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function SuggestedReads({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) return null;

  return (
    <div>
      <h3 className={styles.sectionHeading}>Suggested Next Reads</h3>
      <div className={styles.suggestionsGrid}>
        {suggestions.map((s) => (
          <a
            key={s.domainSlug}
            href={`/topics/${s.domainSlug}/${s.topicSlug}`}
            className={styles.suggestionCard}
          >
            <span className={styles.suggestionDomain}>{s.domainLabel}</span>
            <span className={styles.suggestionTopic}>{s.topicTitle}</span>
            <span className={styles.suggestionPct}>
              {s.domainPercentage}% domain complete
            </span>
            <span className={styles.suggestionArrow}>Start reading &rarr;</span>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function DashboardSkeleton() {
  return (
    <>
      <div className={styles.backLink} style={{ width: 100, height: 16 }} />
      <div className={styles.grid}>
        <div className={`${styles.skeleton} ${styles.skeletonTall}`}>
          <div className={styles.shimmer} />
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonTall}`}>
          <div className={styles.shimmer} />
        </div>
      </div>
      <div className={`${styles.skeleton} ${styles.skeletonMedium}`}>
        <div className={styles.shimmer} />
      </div>
      <div className={`${styles.skeleton} ${styles.skeletonMedium}`}>
        <div className={styles.shimmer} />
      </div>
      <div className={styles.grid}>
        <div className={`${styles.skeleton} ${styles.skeletonShort}`}>
          <div className={styles.shimmer} />
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonShort}`}>
          <div className={styles.shimmer} />
        </div>
        <div className={`${styles.skeleton} ${styles.skeletonShort}`}>
          <div className={styles.shimmer} />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main client component                                              */
/* ------------------------------------------------------------------ */

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/user/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      const json: DashboardData = await res.json();
      setData(json);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <>
        <a href="/profile" className={styles.backLink}>
          &larr; Back to Profile
        </a>
        <DashboardSkeleton />
      </>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.error}>
        <p>Failed to load dashboard data.</p>
        <button className={styles.errorRetry} onClick={fetchData} type="button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <a href="/profile" className={styles.backLink}>
        &larr; Back to Profile
      </a>

      {/* Top grid: Radar + Heatmap */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Domain Coverage</h2>
          <DomainRadar domains={data.domainStats} />
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Activity Heatmap</h2>
          <ActivityHeatmap visits={data.visits} />
        </div>
      </div>

      {/* Stale Knowledge */}
      <StaleKnowledgeWarnings domains={data.domainStats} />

      {/* Learning Velocity */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Learning Velocity</h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8rem",
            color: "var(--text-tertiary)",
            marginBottom: "var(--space-3)",
          }}
        >
          Topics completed per week (last 12 weeks)
        </p>
        <LearningVelocity velocity={data.velocity} />
      </div>

      {/* Suggested Reads */}
      <SuggestedReads suggestions={data.suggestions} />
    </>
  );
}
