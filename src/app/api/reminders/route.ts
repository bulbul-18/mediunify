import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listReminders, createManualReminder } from "@/lib/reminders";

async function getDemoPatient() {
  return prisma.patient.upsert({
    where: { authId: "demo-user" },
    update: {},
    create: { authId: "demo-user", name: "Aanya" },
  });
}

export async function GET() {
  try {
    const patient = await getDemoPatient();
    const reminders = await listReminders(patient.id);
    return NextResponse.json({ reminders });
  } catch (err) {
    console.error("Listing reminders failed:", err);
    return NextResponse.json({ error: "Could not load reminders." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { medication, dosage, scheduledAt } = await request.json();
    if (!medication || !dosage || !scheduledAt) {
      return NextResponse.json(
        { error: "Medication, dosage, and time are required" },
        { status: 400 }
      );
    }

    const patient = await getDemoPatient();
    const reminder = await createManualReminder(
      patient.id,
      medication,
      dosage,
      new Date(scheduledAt)
    );

    return NextResponse.json({ reminder });
  } catch (err) {
    console.error("Creating reminder failed:", err);
    return NextResponse.json({ error: "Could not create the reminder." }, { status: 500 });
  }
}