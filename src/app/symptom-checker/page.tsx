"use client";

import { useState } from "react";
import { AppNavbar } from "@/components/AppNavbar";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

type Status = "idle" | "processing" | "done" | "error";

type CheckResult = {
  diagnosis: string;
  confidence: number;
  safetyFlags: string[];
  nextStep: string;
  historyUsed: string[];
};

const QUICK_SYMPTOMS = ["Headache", "Fever", "Fatigue", "Nausea", "Cough"];
const SEVERITIES = ["Mild", "Moderate", "Severe"];

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
  const [result, setResult] = useState<CheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  function addSymptom(label: string) {
    setSymptoms((prev) => (prev ? prev + ", " + label.toLowerCase() : label));
  }

  async function handleCheck() {
    if (!symptoms.trim()) return;
    setStatus("processing");
    setErrorMessage("");

    try {
      const res = await fetch("/api/symptom-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: symptoms + " (severity: " + severity + ")" }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Symptom check failed");
      }

      setResult(data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
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

            {status === "error" && (
              <div className="mt-4 rounded-xl bg-coral-light px-4 py-3 text-sm text-foreground">
                {errorMessage}
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-navy">Relevant history used</h3>
              {result && result.historyUsed.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {result.historyUsed.map((item, i) => (
                    <li key={i} className="text-sm text-foreground/80">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-foreground/50">
                  {status === "done"
                    ? "No prior documents or sessions were on file for this check."
                    : "Run a check to see which parts of your history the AI used."}
                </p>
              )}
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
              result && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-purple-light p-5">
                    <p className="text-xs font-bold tracking-wide text-purple">
                      AI SUGGESTION
                    </p>
                    <p className="mt-2 font-semibold text-foreground">{result.diagnosis}</p>
                    <div className="mt-3">
                      <ConfidenceBadge confidence={result.confidence} />
                    </div>
                  </div>

                  {result.safetyFlags.length > 0 && (
                    <div className="rounded-2xl bg-coral-light p-5">
                      <p className="font-semibold text-foreground">Safety notes</p>
                      <ul className="mt-2 space-y-1">
                        {result.safetyFlags.map((flag, i) => (
                          <li key={i} className="text-sm text-foreground/80">
                            {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="rounded-2xl bg-teal-light p-5">
                    <p className="font-semibold text-teal-dark">Suggested next step</p>
                    <p className="mt-2 text-sm text-teal-dark/90">{result.nextStep}</p>
                  </div>
                </div>
              )
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