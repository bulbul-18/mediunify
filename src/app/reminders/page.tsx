"use client";

import { useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";

type Reminder = {
  id: string;
  name: string;
  detail: string;
  flagged: boolean;
  on: boolean;
};

const INITIAL_REMINDERS: Reminder[] = [
  { id: "1", name: "Amoxicillin, 500mg", detail: "Today, 8:00 PM", flagged: false, on: true },
  { id: "2", name: "Amoxicillin, 500mg", detail: "Tomorrow, 8:00 AM", flagged: false, on: true },
  { id: "3", name: "Atorvastatin, 20mg", detail: "Tomorrow, 9:00 PM", flagged: false, on: true },
  {
    id: "4",
    name: "Metformin, 5000mg",
    detail: "Dose looked unusual, confirm before we remind you",
    flagged: true,
    on: false,
  },
];

const WEEK = [
  { day: "M", state: "taken" },
  { day: "T", state: "taken" },
  { day: "W", state: "missed" },
  { day: "T", state: "taken" },
  { day: "F", state: "taken" },
  { day: "S", state: "upcoming" },
  { day: "S", state: "upcoming" },
] as const;

const TREND = [70, 85, 60, 92, 88, 95, 92];

const DAY_COLOR: Record<string, string> = {
  taken: "bg-teal",
  missed: "bg-coral",
  upcoming: "bg-navy/15",
};

const TABS = ["Today", "Upcoming", "Missed"];

export default function RemindersPage() {
  const [reminders, setReminders] = useState(INITIAL_REMINDERS);
  const [tab, setTab] = useState("Today");

  function toggle(id: string) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r))
    );
  }

  return (
    <div className="min-h-full bg-background">
      <AppNavbar active="Reminders" />

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-display text-2xl text-navy">Reminders</p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-xl border border-navy/10 bg-white p-4">
                <span className="inline-block h-5 w-5 rounded-full bg-teal" />
                <p className="mt-3 text-2xl font-bold text-navy">92%</p>
                <p className="mt-1 text-xs text-foreground/60">Adherence this week</p>
              </div>
              <div className="flex gap-2">
                {WEEK.map((d, i) => (
                  <div
                    key={i}
                    className={
                      "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white " +
                      DAY_COLOR[d.state]
                    }
                  >
                    {d.day}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={
                    "rounded-full px-4 py-1.5 text-sm font-medium " +
                    (tab === t
                      ? "bg-teal text-white"
                      : "border border-navy/20 text-foreground hover:bg-navy/5")
                  }
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {reminders.map((r) => (
                <div
                  key={r.id}
                  className={
                    "flex items-center justify-between rounded-xl border p-4 " +
                    (r.flagged
                      ? "border-coral/30 bg-coral-light/60"
                      : "border-navy/10 bg-white")
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        "h-7 w-7 rounded-full " + (r.flagged ? "bg-coral-light" : "bg-teal-light")
                      }
                    />
                    <div>
                      <p className="font-medium text-foreground">{r.name}</p>
                      <p className={"text-xs " + (r.flagged ? "text-foreground/70" : "text-foreground/50")}>
                        {r.detail}
                      </p>
                    </div>
                  </div>
                  {!r.flagged && (
                    <button
                      onClick={() => toggle(r.id)}
                      className={
                        "h-6 w-11 rounded-full p-0.5 transition-colors " +
                        (r.on ? "bg-teal" : "bg-navy/20")
                      }
                      aria-label="Toggle reminder"
                    >
                      <span
                        className={
                          "block h-5 w-5 rounded-full bg-white transition-transform " +
                          (r.on ? "translate-x-5" : "translate-x-0")
                        }
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button className="mt-4 rounded-full border border-navy/20 px-5 py-2 text-sm font-medium text-navy hover:bg-navy/5">
              Add reminder manually
            </button>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-5">
            <h3 className="text-sm font-semibold text-navy">Adherence trend</h3>
            <div className="mt-6 flex items-end gap-3" style={{ height: 140 }}>
              {TREND.map((v, i) => (
                <div
                  key={i}
                  className="w-6 rounded bg-teal"
                  style={{ height: v + "%" }}
                />
              ))}
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-navy/10 pt-4 text-xs text-foreground/50">
          MediUnify provides informational suggestions and is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}