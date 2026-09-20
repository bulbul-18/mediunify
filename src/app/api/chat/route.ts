import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listConversations, createConversation } from "@/lib/chat";

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
    const conversations = await listConversations(patient.id);
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("Listing conversations failed:", err);
    return NextResponse.json({ error: "Could not load conversations." }, { status: 500 });
  }
}

export async function POST() {
  try {
    const patient = await getDemoPatient();
    const conversation = await createConversation(patient.id);
    return NextResponse.json({ conversation });
  } catch (err) {
    console.error("Creating conversation failed:", err);
    return NextResponse.json({ error: "Could not create a new chat." }, { status: 500 });
  }
}