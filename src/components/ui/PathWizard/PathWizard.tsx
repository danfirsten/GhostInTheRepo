"use client";

import { useState, useEffect, useRef } from "react";
import type { Domain, LearningPath } from "@/types/content";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Compass,
  Clock,
  Gauge,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  CaretRight,
} from "@phosphor-icons/react";
import { getDomainIconClient } from "@/lib/domain-icons-client";
import styles from "./PathWizard.module.css";

/* ── Goal definitions ─────────────────────────── */

interface GoalOption {
  id: string;
  label: string;
  description: string;
  domainSlugs: string[];
  matchingPaths: string[];
}

const GOALS: GoalOption[] = [
  {
    id: "backend",
    label: "Backend Engineer",
    description: "APIs, databases, distributed systems, and infrastructure.",
    domainSlugs: [
      "fundamentals",
      "databases",
      "software-engineering",
      "cloud-devops",
      "networking",
    ],
    matchingPaths: ["systems-foundations", "web-engineer"],
  },
  {
    id: "fullstack",
    label: "Full-Stack Developer",
    description: "Frontend to backend to deployment — the complete stack.",
    domainSlugs: [
      "fundamentals",
      "web-development",
      "databases",
      "cloud-devops",
      "software-engineering",
    ],
    matchingPaths: ["full-stack", "web-engineer"],
  },
  {
    id: "security",
    label: "Security Specialist",
    description: "Defend systems, break systems, think like a hacker.",
    domainSlugs: [
      "networking",
      "cybersecurity",
      "hacker-mindset",
      "operating-systems",
    ],
    matchingPaths: ["security-hacking"],
  },
  {
    id: "ai-ml",
    label: "AI / ML Engineer",
    description: "Machine learning, deep learning, and production AI systems.",
    domainSlugs: [
      "fundamentals",
      "languages",
      "ai-ml",
      "software-engineering",
      "cloud-devops",
    ],
    matchingPaths: ["ai-engineer"],
  },
  {
    id: "systems",
    label: "Systems / Low-Level",
    description: "OS internals, systems programming, and how the machine works.",
    domainSlugs: [
      "fundamentals",
      "operating-systems",
      "systems-programming",
      "terminal-and-tools",
    ],
    matchingPaths: ["systems-foundations", "terminal-wizard"],
  },
  {
    id: "devops",
    label: "DevOps / Cloud",
    description: "CI/CD, containers, infrastructure as code, and observability.",
    domainSlugs: [
      "cloud-devops",
      "networking",
      "terminal-and-tools",
      "operating-systems",
    ],
    matchingPaths: ["terminal-wizard"],
  },
  {
    id: "mobile",
    label: "Mobile / App Developer",
    description: "Native and cross-platform apps for mobile and desktop.",
    domainSlugs: [
      "fundamentals",
      "mobile-dev",
      "web-development",
      "software-engineering",
    ],
    matchingPaths: ["full-stack"],
  },
  {
    id: "general",
    label: "General CS Knowledge",
    description: "A broad survey — a little of everything, deep on nothing yet.",
    domainSlugs: [
      "fundamentals",
      "operating-systems",
      "networking",
      "web-development",
      "databases",
      "languages",
    ],
    matchingPaths: ["systems-foundations", "web-engineer"],
  },
];

const TIME_OPTIONS = [
  { id: "light", label: "2\u20133 hrs / week", weeklyHours: 2.5, icon: "light" },
  { id: "moderate", label: "5\u20137 hrs / week", weeklyHours: 6, icon: "moderate" },
  { id: "intensive", label: "10+ hrs / week", weeklyHours: 10, icon: "intensive" },
] as const;

const DEPTH_OPTIONS = [
  {
    id: "overview",
    label: "Overview",
    description: "Skim the key topics \u2014 get the lay of the land.",
    topicFraction: 0.4,
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Read through core topics and some codex articles.",
    topicFraction: 0.7,
  },
  {
    id: "deep",
    label: "Deep Dive",
    description: "Every topic, every cheatsheet, every codex article.",
    topicFraction: 1.0,
  },
] as const;

/* ── Helpers ──────────────────────────────────── */

interface TailoredResult {
  goal: GoalOption;
  time: (typeof TIME_OPTIONS)[number];
  depth: (typeof DEPTH_OPTIONS)[number];
  domains: Domain[];
  paths: LearningPath[];
  estimatedWeeks: number;
}

function buildResult(
  goalId: string,
  timeId: string,
  depthId: string,
  allDomains: Domain[],
  allPaths: LearningPath[],
): TailoredResult {
  const goal = GOALS.find((g) => g.id === goalId)!;
  const time = TIME_OPTIONS.find((t) => t.id === timeId)!;
  const depth = DEPTH_OPTIONS.find((d) => d.id === depthId)!;

  const domains = goal.domainSlugs
    .map((slug) => allDomains.find((d) => d.slug === slug))
    .filter(Boolean) as Domain[];

  const paths = goal.matchingPaths
    .map((pid) => allPaths.find((p) => p.id === pid))
    .filter(Boolean) as LearningPath[];

  const hoursPerDomain = depth.topicFraction * 10;
  const totalHours = domains.length * hoursPerDomain;
  const estimatedWeeks = Math.max(1, Math.round(totalHours / time.weeklyHours));

  return { goal, time, depth, domains, paths, estimatedWeeks };
}

const LS_KEY = "ghost_learning_path";

function saveLocal(goalId: string, timeId: string, depthId: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ goalId, timeId, depthId }));
  } catch {}
}

function loadLocal(): { goalId: string; timeId: string; depthId: string } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* ── Component ────────────────────────────────── */

interface PathWizardProps {
  domains: Domain[];
  paths: LearningPath[];
}

export function PathWizard({ domains, paths }: PathWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [timeId, setTimeId] = useState<string | null>(null);
  const [depthId, setDepthId] = useState<string | null>(null);
  const [result, setResult] = useState<TailoredResult | null>(null);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  // Load saved path on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    async function load() {
      // Try server first if logged in
      if (user) {
        try {
          const res = await fetch("/api/user/learning-path");
          if (res.ok) {
            const data = await res.json();
            if (data?.goal_id && data?.time_id && data?.depth_id) {
              setGoalId(data.goal_id);
              setTimeId(data.time_id);
              setDepthId(data.depth_id);
              setResult(buildResult(data.goal_id, data.time_id, data.depth_id, domains, paths));
              setStep(3);
              setLoading(false);
              return;
            }
          }
        } catch {}
      }

      // Fall back to localStorage
      const local = loadLocal();
      if (local) {
        setGoalId(local.goalId);
        setTimeId(local.timeId);
        setDepthId(local.depthId);
        setResult(buildResult(local.goalId, local.timeId, local.depthId, domains, paths));
        setStep(3);
      }

      setLoading(false);
    }

    load();
  }, [user, domains, paths]);

  const canAdvance =
    (step === 0 && goalId !== null) ||
    (step === 1 && timeId !== null) ||
    (step === 2 && depthId !== null);

  function advance() {
    if (step < 2) {
      setStep(step + 1);
    } else if (goalId && timeId && depthId) {
      setResult(buildResult(goalId, timeId, depthId, domains, paths));
      setStep(3);

      // Persist
      saveLocal(goalId, timeId, depthId);
      if (user) {
        fetch("/api/user/learning-path", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal_id: goalId, time_id: timeId, depth_id: depthId }),
        }).catch(() => {});
      }
    }
  }

  function reset() {
    setStep(0);
    setGoalId(null);
    setTimeId(null);
    setDepthId(null);
    setResult(null);
  }

  const STEPS = [
    { label: "Goal", icon: Compass },
    { label: "Time", icon: Clock },
    { label: "Depth", icon: Gauge },
  ];

  if (loading) {
    return (
      <div className={styles.wizard}>
        <div className={styles.loadingSkeleton}>
          <div className={styles.skeletonBar} />
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonGrid}>
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
            <div className={styles.skeletonCard} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wizard}>
      {/* Progress indicator */}
      {step < 3 && (
        <div className={styles.progress}>
          {STEPS.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <div
                key={s.label}
                className={`${styles.progressStep} ${i === step ? styles.progressActive : ""} ${i < step ? styles.progressDone : ""}`}
              >
                <span className={styles.progressDot}>
                  {i < step ? (
                    <CheckCircle size={18} weight="fill" />
                  ) : (
                    <StepIcon size={18} weight={i === step ? "duotone" : "thin"} />
                  )}
                </span>
                <span className={styles.progressLabel}>{s.label}</span>
                {i < 2 && <span className={styles.progressLine} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Step 0: Goal */}
      {step === 0 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>What do you want to build?</h2>
          <p className={styles.stepSubtitle}>
            Pick the role or area that best fits your direction.
          </p>
          <div className={styles.goalGrid}>
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`${styles.goalCard} ${goalId === g.id ? styles.goalCardActive : ""}`}
                onClick={() => setGoalId(g.id)}
              >
                <div className={styles.goalLabel}>{g.label}</div>
                <div className={styles.goalDesc}>{g.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Time */}
      {step === 1 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>How much time per week?</h2>
          <p className={styles.stepSubtitle}>
            Be honest — consistency beats intensity.
          </p>
          <div className={styles.timeGrid}>
            {TIME_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.timeCard} ${timeId === t.id ? styles.timeCardActive : ""}`}
                onClick={() => setTimeId(t.id)}
              >
                <Clock
                  size={28}
                  weight={timeId === t.id ? "duotone" : "thin"}
                  className={styles.timeIcon}
                />
                <div className={styles.timeLabel}>{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Depth */}
      {step === 2 && (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>How deep do you want to go?</h2>
          <p className={styles.stepSubtitle}>
            You can always come back and go deeper later.
          </p>
          <div className={styles.depthGrid}>
            {DEPTH_OPTIONS.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`${styles.depthCard} ${depthId === d.id ? styles.depthCardActive : ""}`}
                onClick={() => setDepthId(d.id)}
              >
                <div className={styles.depthLabel}>{d.label}</div>
                <div className={styles.depthDesc}>{d.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      {step < 3 && (
        <div className={styles.nav}>
          {step > 0 ? (
            <button
              type="button"
              className={styles.navBack}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft size={16} weight="bold" />
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={styles.navNext}
            disabled={!canAdvance}
            onClick={advance}
          >
            {step === 2 ? "Build My Path" : "Next"}
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <h2 className={styles.resultTitle}>Your Learning Path</h2>
            <div className={styles.resultMeta}>
              <span className={styles.resultTag}>{result.goal.label}</span>
              <span className={styles.resultTag}>{result.time.label}</span>
              <span className={styles.resultTag}>{result.depth.label}</span>
            </div>
            <p className={styles.resultEstimate}>
              ~{result.estimatedWeeks} weeks at your pace
            </p>
          </div>

          <div className={styles.resultDomains}>
            {result.domains.map((domain, i) => {
              const Icon = getDomainIconClient(domain.slug);
              return (
                <div key={domain.slug} className={styles.resultDomainRow}>
                  <div className={styles.resultDomainIndex}>{i + 1}</div>
                  <a
                    href={`/topics/${domain.slug}`}
                    className={styles.resultDomainCard}
                  >
                    <span className={styles.resultDomainIcon}>
                      <Icon size={22} weight="duotone" />
                    </span>
                    <div className={styles.resultDomainInfo}>
                      <div className={styles.resultDomainName}>
                        {domain.label}
                      </div>
                      <div className={styles.resultDomainDesc}>
                        {domain.description}
                      </div>
                    </div>
                    <CaretRight
                      size={16}
                      weight="bold"
                      className={styles.resultDomainArrow}
                    />
                  </a>
                </div>
              );
            })}
          </div>

          {result.paths.length > 0 && (
            <div className={styles.resultPaths}>
              <div className={styles.resultPathsLabel}>Matching curated paths</div>
              {result.paths.map((p) => (
                <div key={p.id} className={styles.resultPathItem}>
                  <span className={styles.resultPathName}>{p.name}</span>
                  <span className={styles.resultPathDesc}>{p.description}</span>
                </div>
              ))}
            </div>
          )}

          <button type="button" className={styles.resetBtn} onClick={reset}>
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
