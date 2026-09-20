import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getConversationMessages, sendChatMessage } from "@/lib/chat";

async function getDemoPatient() {
  return prisma.patient.upsert({
    where: { authId: "demo-user" },
    update: {},
    create: { authId: "demo-user", name: "Aanya" },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await getConversationMessages(id);
    return NextResponse.json({ messages });
  } catch (err) {
    console.error("Loading messages failed:", err);
    return NextResponse.json({ error: "Could not load messages." }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    const patient = await getDemoPatient();
    const aiMessage = await sendChatMessage(patient.id, id, text);

    return NextResponse.json({ message: aiMessage });
  } catch (err) {
    console.error("Sending chat message failed:", err);
    const message =
      err instanceof Error && /503|UNAVAILABLE|overloaded/i.test(err.message)
        ? "The AI model is temporarily overloaded. Please try again in a moment."
        : "Something went wrong sending that message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}