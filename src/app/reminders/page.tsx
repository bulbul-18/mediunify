"use client";

import { useEffect, useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";

type Reminder = {
  id: string;
  medication: string;
  dosage: string;
  scheduledAt: string;
  flagged: boolean;
  flagReason: string | null;
  enabled: boolean;
};

const TABS = ["Today", "Upcoming", "Missed"];

function formatDateTime(iso: string) {
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

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Today");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    loadReminders();
  }, []);

  function loadReminders() {
    setLoading(true);
    fetch("/api/reminders")
      .then((res) => res.json())
      .then((data) => setReminders(data.reminders || []))
      .finally(() => setLoading(false));
  }

  async function handleToggle(id: string) {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    try {
      await fetch(`/api/reminders/${id}`, { method: "PATCH" });
    } catch {
      loadReminders();
    }
  }

  async function handleAddReminder() {
    if (!newMed.trim() || !newDosage.trim() || !newTime) return;
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medication: newMed,
          dosage: newDosage,
          scheduledAt: new Date(newTime).toISOString(),
        }),
      });
      if (res.ok) {
        setNewMed("");
        setNewDosage("");
        setNewTime("");
        setShowAddForm(false);
        loadReminders();
      }
    } catch {
      // no dedicated error UI here yet
    }
  }

  const now = new Date();
  const filtered = reminders.filter((r) => {
    const d = new Date(r.scheduledAt);
    if (tab === "Today") return d.toDateString() === now.toDateString();
    if (tab === "Upcoming") return d.getTime() > now.getTime();
    if (tab === "Missed") return d.getTime() < now.getTime() && !r.flagged;
    return true;
  });

  return (
    <div className="min-h-full bg-background">
      <AppNavbar active="Reminders" />

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-display text-2xl text-navy">Reminders</p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="rounded-xl border border-navy/10 bg-white p-4">
            <span className="inline-block h-5 w-5 rounded-full bg-teal" />
            <p className="mt-3 text-2xl font-bold text-navy">
              {reminders.filter((r) => r.enabled).length}
            </p>
            <p className="mt-1 text-xs text-foreground/60">Active reminders</p>
          </div>
          <p className="max-w-xs text-xs text-foreground/40">
            Adherence tracking (streaks, trends over time) isn't built yet, this is a simple
            live count for now.
          </p>
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
          {loading ? (
            <p className="text-sm text-foreground/50">Loading reminders</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-foreground/50">No reminders in this view.</p>
          ) : (
            filtered.map((r) => (
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
                      "h-7 w-7 rounded-full " +
                      (r.flagged ? "bg-coral-light" : "bg-teal-light")
                    }
                  />
                  <div>
                    <p className="font-medium text-foreground">
                      {r.medication}, {r.dosage}
                    </p>
                    <p
                      className={
                        "text-xs " + (r.flagged ? "text-foreground/70" : "text-foreground/50")
                      }
                    >
                      {r.flagged ? r.flagReason : formatDateTime(r.scheduledAt)}
                    </p>
                  </div>
                </div>
                {!r.flagged && (
                  <button
                    onClick={() => handleToggle(r.id)}
                    className={
                      "h-6 w-11 rounded-full p-0.5 transition-colors " +
                      (r.enabled ? "bg-teal" : "bg-navy/20")
                    }
                    aria-label="Toggle reminder"
                  >
                    <span
                      className={
                        "block h-5 w-5 rounded-full bg-white transition-transform " +
                        (r.enabled ? "translate-x-5" : "translate-x-0")
                      }
                    />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 rounded-full border border-navy/20 px-5 py-2 text-sm font-medium text-navy hover:bg-navy/5"
          >
            Add reminder manually
          </button>
        ) : (
          <div className="mt-4 space-y-3 rounded-xl border border-navy/10 bg-white p-4">
            <input
              value={newMed}
              onChange={(e) => setNewMed(e.target.value)}
              placeholder="Medication name"
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
            <input
              value={newDosage}
              onChange={(e) => setNewDosage(e.target.value)}
              placeholder="Dosage (e.g. 500mg)"
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm focus:border-teal focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddReminder}
                className="rounded-full bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark"
              >
                Save
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="rounded-full border border-navy/20 px-4 py-2 text-sm font-medium text-navy hover:bg-navy/5"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <p className="mt-12 border-t border-navy/10 pt-4 text-xs text-foreground/50">
          MediUnify provides informational suggestions and is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}