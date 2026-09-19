import { GoogleGenAI } from "@google/genai";
import { validateMedication } from "./drugReference";

const MODEL_NAME = "gemini-flash-latest";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type ExtractedFieldResult = {
  fieldType: "medication" | "dosage" | "diagnosis" | "lab_value" | "date";
  value: string;
  confidence: number;
  flagged: boolean;
  flagReason?: string;
};

type RawExtraction = {
  medication?: string;
  dosageMg?: number;
  diagnosis?: string;
  date?: string;
};

const EXTRACTION_PROMPT = `You are looking at a photo of a medical prescription or lab report.
Extract the following fields as strict JSON, with no markdown formatting and no extra text:
{
  "medication": "<primary medication name, or null if none found>",
  "dosageMg": <dosage in milligrams as a number, or null>,
  "diagnosis": "<diagnosis or reason for visit, or null>",
  "date": "<date on the document in YYYY-MM-DD format, or null>"
}
If a field isn't present or you can't read it clearly, use null for that field. Respond with only the JSON object.`;

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

      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }

      const delayMs = 1500 * attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export async function extractDocumentFields(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractedFieldResult[]> {
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

  if (parsed.medication) {
    fields.push({
      fieldType: "medication",
      value: parsed.medication,
      confidence: 0.9,
      flagged: false,
    });
  }

  if (parsed.medication && parsed.dosageMg != null) {
    const validation = validateMedication(parsed.medication, parsed.dosageMg);
    fields.push({
      fieldType: "dosage",
      value: `${parsed.dosageMg}mg`,
      confidence: 0.85,
      flagged: validation.flagged,
      flagReason: validation.flagReason,
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

  return fields;
}