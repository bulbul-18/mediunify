import { GoogleGenAI } from "@google/genai";
import { validateMedication } from "./drugReference";

const MODEL_NAME = "gemini-flash-latest";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateWithRetry(
  params: Parameters<typeof ai.models.generateContent>[0],
  maxAttempts = 3
) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await ai.models.generateContent(params);
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

export type ExtractedFieldResult = {
  fieldType: "medication" | "dosage" | "diagnosis" | "lab_value" | "date";
  value: string;
  confidence: number;
  flagged: boolean;
  flagReason?: string;
};

export type ParsedMedication = {
  name: string;
  dosageMg: number | null;
  frequencyPerDay: number | null;
  timing: string | null;
  durationDays: number | null;
  dosageLabel: string;
  flagged: boolean;
  flagReason?: string;
};

export type ExtractionResult = {
  fields: ExtractedFieldResult[];
  medications: ParsedMedication[];
};

type RawMedication = {
  name?: string;
  dosageMg?: number | null;
  frequencyPerDay?: number | null;
  timing?: string | null;
  durationDays?: number | null;
};

type RawExtraction = {
  medications?: RawMedication[];
  diagnosis?: string;
  date?: string;
};

const EXTRACTION_PROMPT = `You are looking at a photo of a medical prescription or lab report, which may list one or more medications.
Extract the following as strict JSON, with no markdown formatting and no extra text:
{
  "medications": [
    {
      "name": "<medication name>",
      "dosageMg": <number in milligrams if explicitly stated, otherwise null>,
      "frequencyPerDay": <number of times per day it should be taken, if stated (e.g. "1 morning, 1 night" = 2), otherwise null>,
      "timing": "<'before food', 'after food', or null if not stated>",
      "durationDays": <number of days the course lasts, if stated, otherwise null>
    }
  ],
  "diagnosis": "<diagnosis or reason for visit, or null>",
  "date": "<date on the document in YYYY-MM-DD format, or null>"
}
List every distinct medication found, there may be more than one. If a field isn't present or unclear, use null for that field. Respond with only the JSON object.`;

function describeFrequency(
  frequencyPerDay: number | null,
  timing: string | null,
  durationDays: number | null
): string {
  const parts: string[] = [];
  if (frequencyPerDay) parts.push(`${frequencyPerDay}x daily`);
  if (timing) parts.push(timing);
  if (durationDays) parts.push(`${durationDays} days`);
  return parts.length ? parts.join(", ") : "as directed";
}

export async function extractDocumentFields(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractionResult> {
  const base64Image = fileBuffer.toString("base64");

  let response;
  try {
    response = await generateWithRetry({
      model: MODEL_NAME,
      contents: [
        {
          role: "user",
          parts: [
            { text: EXTRACTION_PROMPT },
            { inlineData: { mimeType, data: base64Image } },
          ],
        },
      ],
    });
  } catch (err) {
    if (err instanceof Error && /503|UNAVAILABLE|overloaded/i.test(err.message)) {
      throw new Error(
        "The AI model is temporarily overloaded (this is Google's free tier, not our app). Please try again in a moment."
      );
    }
    throw err;
  }

  const rawText = response.text ?? "{}";
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed: RawExtraction;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Could not parse extraction result as JSON: " + rawText);
  }

  const fields: ExtractedFieldResult[] = [];
  const medications: ParsedMedication[] = [];

  for (const rawMed of parsed.medications ?? []) {
    if (!rawMed.name) continue;

    fields.push({
      fieldType: "medication",
      value: rawMed.name,
      confidence: 0.9,
      flagged: false,
    });

    let dosageLabel: string;
    let flagged = false;
    let flagReason: string | undefined;

    if (rawMed.dosageMg != null) {
      const validation = validateMedication(rawMed.name, rawMed.dosageMg);
      dosageLabel = `${rawMed.dosageMg}mg`;
      flagged = validation.flagged;
      flagReason = validation.flagReason;
    } else if (rawMed.frequencyPerDay != null) {
      dosageLabel = describeFrequency(
        rawMed.frequencyPerDay,
        rawMed.timing ?? null,
        rawMed.durationDays ?? null
      );
      if (rawMed.frequencyPerDay > 4 || rawMed.frequencyPerDay < 1) {
        flagged = true;
        flagReason = `${rawMed.frequencyPerDay}x/day looks unusual, please confirm this frequency.`;
      }
    } else {
      dosageLabel = "Dosage not specified";
      flagged = true;
      flagReason = "No dosage or frequency could be read from this document, please confirm manually.";
    }

    fields.push({
      fieldType: "dosage",
      value: dosageLabel,
      confidence: 0.85,
      flagged,
      flagReason,
    });

    medications.push({
      name: rawMed.name,
      dosageMg: rawMed.dosageMg ?? null,
      frequencyPerDay: rawMed.frequencyPerDay ?? null,
      timing: rawMed.timing ?? null,
      durationDays: rawMed.durationDays ?? null,
      dosageLabel,
      flagged,
      flagReason,
    });
  }

  if (parsed.diagnosis) {
    fields.push({
      fieldType: "diagnosis",
      value: parsed.diagnosis,
      confidence: 0.8,
      flagged: false,
    });
  }

  if (parsed.date) {
    fields.push({
      fieldType: "date",
      value: parsed.date,
      confidence: 0.95,
      flagged: false,
    });
  }

  return { fields, medications };
}