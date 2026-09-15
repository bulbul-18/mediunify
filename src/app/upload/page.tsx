"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

type Status = "idle" | "processing" | "done";

type Field = {
  label: string;
  value: string;
  confidence: number;
  flagged: boolean;
  reason?: string;
};

const MOCK_FIELDS: Field[] = [
  { label: "MEDICATION", value: "Metformin", confidence: 0.94, flagged: false },
  {
    label: "DOSAGE",
    value: "5000mg",
    confidence: 0.88,
    flagged: true,
    reason: "5000mg is outside the typical range (500-1000mg)",
  },
  { label: "DATE", value: "2026-03-12", confidence: 0.99, flagged: false },
];

const STEPS = ["Upload", "Extract", "Verify", "Done"];

export default function UploadPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentStep = status === "idle" ? 0 : status === "processing" ? 1 : 3;

  function handleFileSelect(file: File) {
    setPreview(URL.createObjectURL(file));
    setFileName(file.name);
    setStatus("idle");
  }

  function handleExtract() {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 1200);
  }

  return (
    <div className="min-h-full bg-background">
      <AppNavbar active="Upload" />

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-display text-2xl text-navy">Upload a document</p>
        <p className="mt-1 text-sm text-foreground/60">
          A prescription or lab report, we'll extract and verify the details automatically.
        </p>

        <div className="mt-6 flex items-center gap-3">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white " +
                    (i <= currentStep ? "bg-teal" : "bg-navy/20")
                  }
                >
                  {i + 1}
                </span>
                <span
                  className={
                    "text-sm " +
                    (i <= currentStep ? "font-semibold text-navy" : "text-foreground/40")
                  }
                >
                  {step}
                </span>
              </div>
              {i < STEPS.length - 1 && <span className="h-px w-10 bg-navy/15" />}
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />

            {!preview ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-navy/25 bg-white py-24 text-navy/60 hover:border-teal hover:text-teal"
              >
                <span className="font-medium">Click to select a file</span>
                <span className="mt-1 text-xs">or drag and drop an image / PDF</span>
              </button>
            ) : (
              <div className="overflow-hidden rounded-2xl border-2 border-navy bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Selected document preview"
                  className="h-64 w-full object-contain bg-navy/5"
                />
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-navy">{fileName}</p>
                    <p className="text-xs text-foreground/50">Preview</p>
                  </div>
                  {status === "idle" && (
                    <button
                      onClick={handleExtract}
                      className="rounded-full bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-dark"
                    >
                      Extract & verify
                    </button>
                  )}
                </div>
              </div>
            )}

            <p className="mt-3 text-xs text-foreground/50">
              Accepted: JPG, PNG, PDF. Max 10MB
            </p>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-navy">Recent uploads</h3>
              <div className="mt-3 space-y-2">
                {[
                  { name: "lab_report_feb.pdf", date: "Feb 28" },
                  { name: "visit_notes.jpg", date: "Feb 10" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground/80">
                      <span className="h-2 w-2 rounded-full bg-teal-light ring-1 ring-teal/40" />
                      {item.name}
                    </span>
                    <span className="text-foreground/40">{item.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg text-navy">Here's what we found</h3>

            {status !== "done" ? (
              <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-8 text-center text-sm text-foreground/50">
                {status === "processing"
                  ? "Reading your document and checking it against known drug data"
                  : "Upload a document and click Extract and verify to see results here."}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {MOCK_FIELDS.map((field) => (
                  <div
                    key={field.label}
                    className={
                      "rounded-xl border p-4 " +
                      (field.flagged
                        ? "border-coral/30 bg-coral-light/60"
                        : "border-navy/10 bg-white")
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide text-foreground/40">
                        {field.label}
                      </span>
                      <ConfidenceBadge confidence={field.confidence} />
                    </div>
                    <p className="mt-1 font-medium text-foreground">{field.value}</p>
                    {field.flagged && field.reason && (
                      <p className="mt-2 text-sm text-[#712B13]">{field.reason}</p>
                    )}
                  </div>
                ))}

                <div className="rounded-xl bg-teal-light p-4">
                  <p className="text-sm font-semibold text-teal-dark">Why we check this</p>
                  <p className="mt-1 text-sm text-teal-dark/90">
                    Scanned dosages are cross-checked against known drug ranges before they're trusted.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="mt-2 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-ink"
                >
                  Done, back to timeline
                </Link>
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