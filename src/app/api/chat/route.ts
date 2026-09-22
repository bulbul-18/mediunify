import { NextResponse } from "next/server";
import { listConversations, createConversation } from "@/lib/chat";
import { getCurrentPatient } from "@/lib/auth";

export async function GET() {
  try {
    const patient = await getCurrentPatient();
    const conversations = await listConversations(patient.id);
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("Listing conversations failed:", err);
    return NextResponse.json({ error: "Could not load conversations." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const patient = await getCurrentPatient();
    const conversation = await createConversation(patient.id);
    return NextResponse.json({ conversation });
  } catch (err) {
    console.error("Creating conversation failed:", err);
    return NextResponse.json({ error: "Could not create a new chat." }, { status: 500 });
  }
}