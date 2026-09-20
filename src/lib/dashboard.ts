import { prisma } from "./prisma";
import type { TimelineEntry } from "@/components/Timeline";

export type DashboardStats = {
  documents: number;
  checkInsThisMonth: number;
  flagged: number;
};

export type DashboardData = {
  stats: DashboardStats;
  timeline: TimelineEntry[];
  latestCheckIn: { diagnosis: string; confidence: number } | null;
  upcomingReminder: { medication: string; dosage: string; scheduledAt: string } | null;
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

type FieldRow = {
  fieldType: string;
  value: string;
  flagged: boolean;
  flagReason: string | null;
};

type RawEntry = {
  id: string;
  rawDate: Date;
  kind: TimelineEntry["kind"];
  title: string;
  detail: string;
};

export async function getDashboardData(patientId: string): Promise<DashboardData> {
  const documents = await prisma.document.findMany({
    where: { patientId },
    include: { extractedFields: true },
    orderBy: { uploadedAt: "desc" },
  });

  const sessions = await prisma.session.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let flaggedCount = 0;
  const rawEntries: RawEntry[] = [];

  for (const doc of documents) {
    const fields = doc.extractedFields as FieldRow[];
    const med = fields.find((f) => f.fieldType === "medication");
    const dosage = fields.find((f) => f.fieldType === "dosage");
    const diagnosis = fields.find((f) => f.fieldType === "diagnosis");
    const docLabel = doc.documentType === "prescription" ? "Prescription" : "Report";

    const title = med
      ? `${docLabel} — ${med.value}${dosage ? " " + dosage.value : ""}`
      : diagnosis
      ? `${docLabel} — ${diagnosis.value}`
      : `${docLabel} uploaded`;

    rawEntries.push({
      id: doc.id,
      rawDate: doc.uploadedAt,
      kind: "document",
      title,
      detail: "Extracted and verified against drug database",
    });

    for (const f of fields) {
      if (f.flagged) {
        flaggedCount++;
        rawEntries.push({
          id: `${doc.id}-flag-${f.fieldType}`,
          rawDate: doc.uploadedAt,
          kind: "flag",
          title: `${f.fieldType === "dosage" ? "Dosage" : f.fieldType} flagged`,
          detail: f.flagReason || "Please review this value.",
        });
      }
    }
  }

  let checkInsThisMonth = 0;
  for (const s of sessions) {
    if (s.createdAt >= startOfMonth) checkInsThisMonth++;
    rawEntries.push({
      id: s.id,
      rawDate: s.createdAt,
      kind: "session",
      title: `Symptom check — ${truncate(s.symptomsInput, 50)}`,
      detail: `Suggested: ${s.diagnosis}`,
    });
  }

  rawEntries.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
  const timeline: TimelineEntry[] = rawEntries.slice(0, 8).map((e) => ({
    id: e.id,
    date: formatDate(e.rawDate),
    kind: e.kind,
    title: e.title,
    detail: e.detail,
  }));

  const latestCheckIn = sessions[0]
    ? { diagnosis: sessions[0].diagnosis, confidence: sessions[0].confidence ?? 0.5 }
    : null;

  const upcomingReminderRow = await prisma.reminder.findFirst({
    where: { patientId, enabled: true, scheduledAt: { gte: now } },
    orderBy: { scheduledAt: "asc" },
  });

  const upcomingReminder = upcomingReminderRow
    ? {
        medication: upcomingReminderRow.medication,
        dosage: upcomingReminderRow.dosage,
        scheduledAt: upcomingReminderRow.scheduledAt.toISOString(),
      }
    : null;

  return {
    stats: {
      documents: documents.length,
      checkInsThisMonth,
      flagged: flaggedCount,
    },
    timeline,
    latestCheckIn,
    upcomingReminder,
  };
}