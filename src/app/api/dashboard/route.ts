import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/dashboard";

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
    const data = await getDashboardData(patient.id);
    return NextResponse.json({ ...data, patientName: patient.name });
  } catch (err) {
    console.error("Loading dashboard failed:", err);
    return NextResponse.json({ error: "Could not load dashboard." }, { status: 500 });
  }
}