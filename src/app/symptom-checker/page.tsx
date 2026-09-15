"use client";

import { useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

type Status = "idle" | "processing" | "done";

const QUICK_SYMPTOMS = ["Headache", "Fever", "Fatigue", "Nausea", "Cough"];
const SEVERITIES = ["Mild", "Moderate", "Severe"];

const RELEVANT_HISTORY = [
  "Prescription: Amoxicillin 500mg (Feb 28)",
  "Visit notes: Annual checkup (Feb 10)",
];

const RECENT_CHECKS = [
  { date: "Mar 5", summary: "Sore throat, likely viral" },
  { date: "Feb 20", summary: "Fatigue, suggested rest and hydration" },
];

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
        (selected
          ? "bg-teal text-white"
          : "border border-navy/20 text-foreground hover:bg-navy/5")
      }
    >
      {label}
    </button>
  );
}

export default function SymptomCheckerPage() {
  const [symptoms, setSymptoms] = useState(
    "Mild headache since this morning, a bit tired"
  );
  const [severity, setSeverity] = useState("Mild");
  const [status, setStatus] = useState<Status>("idle");

  function addSymptom(label: string) {
    setSymptoms((prev) => (prev ? prev + ", " + label.toLowerCase() : label));
  }

  function handleCheck() {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 1200);
  }

  return (
    <div className="min-h-full bg-background">
      <AppNavbar active="Check symptoms" />

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-display text-2xl text-navy">Check symptoms</p>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-navy/20 bg-white p-4 text-sm text-foreground focus:border-teal focus:outline-none"
            />

            <div className="mt-4">
              <p className="text-xs text-foreground/50">Quick add:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_SYMPTOMS.map((s) => (
                  <Chip key={s} label={s} selected={false} onClick={() => addSymptom(s)} />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs text-foreground/50">Severity:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SEVERITIES.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    selected={severity === s}
                    onClick={() => setSeverity(s)}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCheck}
              disabled={status === "processing"}
              className="mt-5 rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-dark disabled:opacity-60"
            >
              {status === "processing" ? "Checking" : "Check"}
            </button>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-navy">Relevant history used</h3>
              <ul className="mt-2 space-y-1">
                {RELEVANT_HISTORY.map((item) => (
                  <li key={item} className="text-sm text-foreground/80">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-navy">Recent checks</h3>
              <div className="mt-2 space-y-1.5">
                {RECENT_CHECKS.map((c) => (
                  <div key={c.date} className="flex gap-3 text-sm">
                    <span className="w-12 text-foreground/40">{c.date}</span>
                    <span className="text-foreground/80">{c.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            {status !== "done" ? (
              <div className="rounded-2xl border border-navy/10 bg-white p-8 text-center text-sm text-foreground/50">
                {status === "processing"
                  ? "Comparing your symptoms against your history"
                  : "Describe your symptoms and click Check to see a grounded suggestion here."}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-purple-light p-5">
                  <p className="text-xs font-bold tracking-wide text-purple">
                    AI SUGGESTION
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    Tension headache, possibly linked to dehydration
                  </p>
                  <div className="mt-3">
                    <ConfidenceBadge confidence={0.82} />
                  </div>
                  <p className="mt-3 text-xs text-foreground/60">
                    Grounded in your Feb 28 prescription and Mar 12 vitals.
                  </p>
                </div>

                <div className="rounded-2xl bg-coral-light p-5">
                  <p className="font-semibold text-foreground">Possible interaction</p>
                  <p className="mt-2 text-sm text-foreground/80">
                    Check with a doctor before taking ibuprofen alongside your current
                    prescription.
                  </p>
                </div>

                <div className="rounded-2xl bg-teal-light p-5">
                  <p className="font-semibold text-teal-dark">Suggested next step</p>
                  <p className="mt-2 text-sm text-teal-dark/90">
                    Rest, hydrate, and monitor for 24 hours.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="mt-12 border-t border-navy/10 pt-4 text-xs text-foreground/50">
          MediUnify provides informational suggestions and is not a substitute for professional medical advice.
        </p>
      </div>
    </div>
  );
}