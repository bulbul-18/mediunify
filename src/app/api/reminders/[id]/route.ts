import { NextRequest, NextResponse } from "next/server";
import { toggleReminder } from "@/lib/reminders";
import { getCurrentPatient } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await getCurrentPatient();
    const reminder = await toggleReminder(id, patient.id);
    return NextResponse.json({ reminder });
  } catch (err) {
    console.error("Toggling reminder failed:", err);
    return NextResponse.json({ error: "Could not update the reminder." }, { status: 500 });
  }
}