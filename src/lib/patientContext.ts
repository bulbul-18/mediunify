import { prisma } from "./prisma";

export async function getPatientContext(patientId: string): Promise<string[]> {
  const documents = await prisma.document.findMany({
    where: { patientId },
    include: { extractedFields: true },
    orderBy: { uploadedAt: "desc" },
    take: 10,
  });

  const historyLines: string[] = [];

  type FieldRow = { fieldType: string; value: string; flagged: boolean };

  for (const doc of documents) {
    const extractedFields = doc.extractedFields as FieldRow[];
    const med = extractedFields.find((f) => f.fieldType === "medication");
    const dosage = extractedFields.find((f) => f.fieldType === "dosage");
    const diagnosis = extractedFields.find((f) => f.fieldType === "diagnosis");
    const date = extractedFields.find((f) => f.fieldType === "date");

    if (med) {
      let line = `${doc.documentType === "prescription" ? "Prescription" : "Report"}: ${med.value}`;
      if (dosage) line += ` ${dosage.value}`;
      if (date) line += ` (${date.value})`;
      if (dosage?.flagged) {
        line += " [NOTE: this dosage was flagged as unusual and may be inaccurate, treat with caution]";
      }
      historyLines.push(line);
    }

    if (diagnosis) {
      historyLines.push(
        `Diagnosis on file: ${diagnosis.value}${date ? ` (${date.value})` : ""}`
      );
    }
  }

  const recentSessions = await prisma.session.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  for (const s of recentSessions) {
    historyLines.push(`Past symptom check: "${s.symptomsInput}", suggested: ${s.diagnosis}`);
  }

  return historyLines;
}