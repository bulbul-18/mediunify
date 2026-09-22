import { NextRequest, NextResponse } from "next/server";
import { runGroundedSymptomCheck } from "@/lib/symptomChecker";
import { getCurrentPatient } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { symptoms } = await request.json();

    if (!symptoms || typeof symptoms !== "string") {
      return NextResponse.json({ error: "Symptoms text is required" }, { status: 400 });
    }

    const patient = await getCurrentPatient();
    const result = await runGroundedSymptomCheck(patient.id, symptoms);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Symptom check failed:", err);
    const message =
      err instanceof Error && /503|UNAVAILABLE|overloaded/i.test(err.message)
        ? "The AI model is temporarily overloaded. Please try again in a moment."
        : "Something went wrong running the symptom check.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}