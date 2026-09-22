import { NextRequest, NextResponse } from "next/server";
import { getConversationMessages, sendChatMessage } from "@/lib/chat";
import { getCurrentPatient } from "@/lib/auth";

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

    const patient = await getCurrentPatient();
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