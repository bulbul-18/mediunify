import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractDocumentFields } from "@/lib/extraction";
import { createRemindersForMedication } from "@/lib/reminders";
import { getCurrentPatient } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const documentType = (formData.get("documentType") as string) || "other";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const patient = await getCurrentPatient();

    const { fields, medications } = await extractDocumentFields(buffer, file.type);

    const document = await prisma.document.create({
      data: {
        patientId: patient.id,
        fileUrl: `local-placeholder/${file.name}`,
        documentType,
        extractedFields: {
          create: fields.map((f) => ({
            fieldType: f.fieldType,
            value: f.value,
            confidence: f.confidence,
            flagged: f.flagged,
            flagReason: f.flagReason,
          })),
        },
      },
      include: { extractedFields: true },
    });

    for (const med of medications) {
      await createRemindersForMedication(patient.id, document.id, med);
    }

    return NextResponse.json({ document });
  } catch (err) {
    console.error("Document upload failed:", err);
    return NextResponse.json(
      { error: "Something went wrong processing this document." },
      { status: 500 }
    );
  }
}