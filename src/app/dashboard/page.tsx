"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { StatCard } from "@/components/StatCard";
import { Timeline, type TimelineEntry } from "@/components/Timeline";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

type DashboardData = {
  patientName: string;
  stats: { documents: number; checkInsThisMonth: number; flagged: number };
  timeline: TimelineEntry[];
  latestCheckIn: { diagnosis: string; confidence: number } | null;
  upcomingReminder: { medication: string; dosage: string; scheduledAt: string } | null;
};

function formatReminderTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (isToday) return `Today, ${time}`;
  if (isTomorrow) return `Tomorrow, ${time}`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + `, ${time}`;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-background">
      <AppNavbar active="Dashboard" />

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-display text-2xl text-navy">
          Hi{data ? `, ${data.patientName}` : ""}
        </p>
        <p className="mt-1 text-sm text-foreground/60">
          Here's everything on file, in one place.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-foreground/50">Loading your dashboard</p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-4">
              <StatCard
                value={String(data?.stats.documents ?? 0)}
                label="Documents on file"
                dotColor="bg-teal"
              />
              <StatCard
                value={String(data?.stats.checkInsThisMonth ?? 0)}
                label="AI check-ins this month"
                dotColor="bg-purple"
              />
              <StatCard
                value={String(data?.stats.flagged ?? 0)}
                label="Flagged for review"
                dotColor="bg-coral"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/upload"
                className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-dark"
              >
                Upload document
              </Link>
              <Link
                href="/symptom-checker"
                className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy/5"
              >
                Check symptoms
              </Link>
              <Link
                href="/chat"
                className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy/5"
              >
                Ask AI
              </Link>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
              <div>
                <h2 className="mb-5 font-display text-lg text-navy">Your timeline</h2>
                {data && data.timeline.length > 0 ? (
                  <Timeline entries={data.timeline} />
                ) : (
                  <p className="text-sm text-foreground/50">
                    Nothing on file yet, upload a document or run a symptom check to get
                    started.
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-purple-light p-5">
                  <h3 className="font-semibold text-foreground">Latest AI check-in</h3>
                  {data?.latestCheckIn ? (
                    <>
                      <p className="mt-2 text-sm text-foreground/80">
                        {data.latestCheckIn.diagnosis}
                      </p>
                      <div className="mt-3">
                        <ConfidenceBadge confidence={data.latestCheckIn.confidence} />
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-foreground/60">
                      No symptom checks yet.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-teal-light p-5">
                  <h3 className="font-semibold text-teal-dark">Upcoming reminder</h3>
                  {data?.upcomingReminder ? (
                    <p className="mt-2 text-sm text-teal-dark/90">
                      {data.upcomingReminder.medication}, {data.upcomingReminder.dosage},{" "}
                      {formatReminderTime(data.upcomingReminder.scheduledAt)}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-teal-dark/70">
                      No upcoming reminders.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl bg-navy/5 p-5">
                  <p className="text-xs font-bold tracking-wide text-navy/60">TIP</p>
                  <p className="mt-2 text-sm text-foreground/70">
                    Upload prescriptions promptly for sharper AI grounding.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <p className="mt-12 border-t border-navy/10 pt-4 text-xs text-foreground/50">
          MediUnify provides informational suggestions and is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}