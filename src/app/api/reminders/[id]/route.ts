import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toggleReminder } from "@/lib/reminders";

async function getDemoPatient() {
  return prisma.patient.upsert({
    where: { authId: "demo-user" },
    update: {},
    create: { authId: "demo-user", name: "Aanya" },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await getDemoPatient();
    const reminder = await toggleReminder(id, patient.id);
    return NextResponse.json({ reminder });
  } catch (err) {
    console.error("Toggling reminder failed:", err);
    return NextResponse.json({ error: "Could not update the reminder." }, { status: 500 });
  }
}