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

export type GroundedCheckResult = {
  diagnosis: string;
  confidence: number;
  safetyFlags: string[];
  nextStep: string;
  historyUsed: string[];
};

const SYSTEM_PROMPT = `You are a cautious healthcare assistant embedded in a patient app. You are NOT a doctor and must never claim certainty.
Given a patient's relevant history and their current symptoms, respond with strict JSON only, no markdown formatting:
{
  "diagnosis": "<a brief, non-definitive suggestion of what this might be, e.g. 'Possible tension headache'>",
  "confidence": <number from 0 to 1>,
  "safetyFlags": ["<any specific safety concern tied to their history, e.g. a possible medication interaction, empty array if none>"],
  "nextStep": "<one brief, practical, safe suggestion>"
}
Always err toward caution. If symptoms sound severe or urgent, say so plainly in nextStep and keep confidence low.`;

export async function runGroundedSymptomCheck(
  patientId: string,
  symptomsInput: string
): Promise<GroundedCheckResult> {
  const historyLines = await getPatientContext(patientId);
  const historyBlock = historyLines.length
    ? historyLines.map((l) => `- ${l}`).join("\n")
    : "(No prior documents or sessions on file.)";

  const prompt = `${SYSTEM_PROMPT}

Patient history:
${historyBlock}

Current symptoms: "${symptomsInput}"

Respond with only the JSON object.`;

  const rawText = await generateWithRetry(prompt);
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: {
    diagnosis?: string;
    confidence?: number;
    safetyFlags?: string[];
    nextStep?: string;
  };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Could not parse symptom check result as JSON: " + rawText);
  }

  const result: GroundedCheckResult = {
    diagnosis: parsed.diagnosis || "Unable to determine a suggestion from the given symptoms.",
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    safetyFlags: Array.isArray(parsed.safetyFlags) ? parsed.safetyFlags : [],
    nextStep: parsed.nextStep || "Consider consulting a doctor if symptoms persist.",
    historyUsed: historyLines,
  };

  await prisma.session.create({
    data: {
      patientId,
      symptomsInput,
      diagnosis: result.diagnosis,
      confidence: result.confidence,
      groundedMode: true,
      safetyFlags: result.safetyFlags,
    },
  });

  return result;
}