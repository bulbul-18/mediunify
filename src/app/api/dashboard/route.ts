import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard";
import { getCurrentPatient } from "@/lib/auth";

export async function GET() {
  try {
    const patient = await getCurrentPatient();
    const data = await getDashboardData(patient.id);
    return NextResponse.json({ ...data, patientName: patient.name });
  } catch (err) {
    console.error("Loading dashboard failed:", err);
    return NextResponse.json({ error: "Could not load dashboard." }, { status: 500 });
  }
}