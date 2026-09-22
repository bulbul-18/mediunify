import { NextRequest, NextResponse } from "next/server";
import { listReminders, createManualReminder } from "@/lib/reminders";
import { getCurrentPatient } from "@/lib/auth";

export async function GET() {
  try {
    const patient = await getCurrentPatient();
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

    const patient = await getCurrentPatient();
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