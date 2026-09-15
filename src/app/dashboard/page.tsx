import Link from "next/link";
import { AppNavbar } from "@/components/AppNavbar";
import { StatCard } from "@/components/StatCard";
import { Timeline, type TimelineEntry } from "@/components/Timeline";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

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
    <div className="min-h-full bg-background">
      <AppNavbar active="Dashboard" />

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <p className="font-display text-2xl text-navy">Hi, Aanya</p>
        <p className="mt-1 text-sm text-foreground/60">
          Here's everything on file, in one place.
        </p>

        <div className="mt-6 flex flex-wrap gap-4">
          <StatCard value="3" label="Documents on file" dotColor="bg-teal" />
          <StatCard value="2" label="AI check-ins this month" dotColor="bg-purple" />
          <StatCard value="1" label="Flagged for review" dotColor="bg-coral" />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/upload" className="rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-dark">
            Upload document
          </Link>
          <Link href="/symptom-checker" className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy/5">
            Check symptoms
          </Link>
          <Link href="/chat" className="rounded-full border border-navy/20 px-5 py-2.5 text-sm font-medium text-navy hover:bg-navy/5">
            Ask AI
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="mb-5 font-display text-lg text-navy">Your timeline</h2>
            <Timeline entries={mockEntries} />
            <Link href="/dashboard" className="mt-6 inline-block text-sm font-semibold text-teal">
              View all history
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-coral-light p-5">
              <h3 className="font-semibold text-navy">Latest AI check-in</h3>
              <p className="mt-2 text-sm text-foreground/80">
                Tension headache, possibly linked to dehydration.
              </p>
              <div className="mt-3">
                <ConfidenceBadge confidence={0.82} />
              </div>
            </div>

            <div className="rounded-2xl bg-teal-light p-5">
              <h3 className="font-semibold text-teal-dark">Upcoming reminder</h3>
              <p className="mt-2 text-sm text-teal-dark/90">
                Amoxicillin 500mg, today at 8:00 PM
              </p>
            </div>

            <div className="rounded-2xl bg-purple-light p-5">
              <p className="text-xs font-bold tracking-wide text-purple">TIP</p>
              <p className="mt-2 text-sm text-foreground/80">
                Upload prescriptions promptly for sharper AI grounding.
              </p>
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