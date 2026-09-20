import { GoogleGenAI } from "@google/genai";
import { prisma } from "./prisma";
import { getPatientContext } from "./patientContext";

const MODEL_NAME = "gemini-flash-latest";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithRetry(prompt: string, maxAttempts = 3): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return response.text ?? "{}";
    } catch (err) {
      lastError = err;
      const isRetryable =
        err instanceof Error && /503|UNAVAILABLE|overloaded/i.test(err.message);
      if (!isRetryable || attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw lastError;
}

const CHAT_SYSTEM_PROMPT = `You are a cautious healthcare assistant chatbot embedded in a patient app called MediUnify. You are NOT a doctor and must never claim certainty.
Answer the user's question conversationally but concisely (2-4 sentences), grounding your answer in their history where it's relevant. If their history doesn't relate to the question, just answer generally and don't force a connection.
Respond with strict JSON only, no markdown formatting:
{
  "reply": "<your conversational answer>",
  "confidence": <number from 0 to 1, reflecting how confident you are given the available context>
}`;

export async function listConversations(patientId: string) {
  return prisma.conversation.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createConversation(patientId: string) {
  return prisma.conversation.create({
    data: { patientId, title: "New chat" },
  });
}

export async function getConversationMessages(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendChatMessage(
  patientId: string,
  conversationId: string,
  userText: string
) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, patientId },
  });
  if (!conversation) {
    throw new Error("Conversation not found for this patient.");
  }

  const existingMessageCount = await prisma.message.count({
    where: { conversationId },
  });

  await prisma.message.create({
    data: { conversationId, role: "user", text: userText },
  });

  if (existingMessageCount === 0) {
    const title = userText.length > 40 ? userText.slice(0, 40) + "…" : userText;
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });
  }

  const historyLines = await getPatientContext(patientId);
  const historyBlock = historyLines.length
    ? historyLines.map((l) => `- ${l}`).join("\n")
    : "(No prior documents or sessions on file.)";

  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
  type MessageRow = { role: string; text: string };
  const conversationBlock = (recentMessages as MessageRow[])
    .slice()
    .reverse()
    .map((m) => `${m.role === "user" ? "Patient" : "Assistant"}: ${m.text}`)
    .join("\n");

  const prompt = `${CHAT_SYSTEM_PROMPT}

Patient history:
${historyBlock}

Conversation so far:
${conversationBlock}

Respond with only the JSON object, answering the patient's most recent message.`;

  const rawText = await generateWithRetry(prompt);
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: { reply?: string; confidence?: number };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Could not parse chat result as JSON: " + rawText);
  }

  const reply = parsed.reply || "I'm not sure how to answer that, could you rephrase?";
  const confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.5;

  const aiMessage = await prisma.message.create({
    data: { conversationId, role: "ai", text: reply, confidence },
  });

  return aiMessage;
}