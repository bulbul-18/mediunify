import Link from "next/link";
import { Timeline, type TimelineEntry } from "@/components/Timeline";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

// Mock data standing in for a real Prisma query
// (Patient -> Documents/Sessions ordered by date) until the pipeline is wired up.
const mockEntries: TimelineEntry[] = [
  {
    id: "1",
    date: "Mar 12",
    kind: "session",
    title: "Symptom check — mild headache, fatigue",
    detail: "Suggested: dehydration or tension headache",
  },
  {
    id: "2",
    date: "Mar 12",
    kind: "flag",
    title: "Dosage flagged on Lab Report",
    detail: "Metformin 5000mg looked implausible — please confirm the correct dose",
  },
  {
    id: "3",
    date: "Feb 28",
    kind: "document",
    title: "Prescription — Amoxicillin 500mg",
    detail: "Extracted and verified against drug database",
  },
  {
    id: "4",
    date: "Feb 10",
    kind: "document",
    title: "Visit notes — Annual checkup",
    detail: "Blood pressure, weight, and general notes on file",
  },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
      <header className="mb-10">
        <p className="font-display text-3xl text-navy">Hi, Aanya</p>
        <p className="mt-1 text-sm text-foreground/60">
          Here&rsquo;s everything on file, in one place.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/upload"
          className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark"
        >
          Upload a document
        </Link>
        <Link
          href="/symptom-checker"
          className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-navy/5"
        >
          Check symptoms
        </Link>
      </div>

      <section
        aria-labelledby="latest-heading"
        className="mb-10 rounded-2xl border border-coral-light bg-coral-light/60 p-5"
      >
        <h2 id="latest-heading" className="font-display text-lg text-navy">
          Latest AI check-in
        </h2>
        <p className="mt-2 text-sm text-foreground/80">
          Based on your symptoms and history, this looks like a tension
          headache, possibly linked to dehydration.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <ConfidenceBadge confidence={0.82} />
          <span className="text-xs text-foreground/60">
            Grounded in your Feb 28 prescription and Mar 12 vitals
          </span>
        </div>
      </section>

      <section aria-labelledby="timeline-heading">
        <h2
          id="timeline-heading"
          className="mb-5 font-display text-lg text-navy"
        >
          Your timeline
        </h2>
        <Timeline entries={mockEntries} />
      </section>

      <p className="mt-12 border-t border-navy/10 pt-4 text-xs text-foreground/50">
        MediUnify provides informational suggestions and is not a substitute
        for professional medical advice. Always consult a doctor for
        diagnosis or treatment.
      </p>
    </div>
  );
}
