type DrugReference = {
  name: string;
  normalDoseMgMin: number;
  normalDoseMgMax: number;
};

const DRUG_REFERENCE: DrugReference[] = [
  { name: "amoxicillin", normalDoseMgMin: 250, normalDoseMgMax: 1000 },
  { name: "metformin", normalDoseMgMin: 500, normalDoseMgMax: 1000 },
  { name: "ibuprofen", normalDoseMgMin: 200, normalDoseMgMax: 800 },
  { name: "paracetamol", normalDoseMgMin: 250, normalDoseMgMax: 1000 },
  { name: "acetaminophen", normalDoseMgMin: 250, normalDoseMgMax: 1000 },
  { name: "atorvastatin", normalDoseMgMin: 10, normalDoseMgMax: 80 },
  { name: "amlodipine", normalDoseMgMin: 2.5, normalDoseMgMax: 10 },
  { name: "omeprazole", normalDoseMgMin: 10, normalDoseMgMax: 40 },
  { name: "azithromycin", normalDoseMgMin: 250, normalDoseMgMax: 500 },
  { name: "ciprofloxacin", normalDoseMgMin: 250, normalDoseMgMax: 750 },
  { name: "losartan", normalDoseMgMin: 25, normalDoseMgMax: 100 },
  { name: "metoprolol", normalDoseMgMin: 25, normalDoseMgMax: 200 },
  { name: "cetirizine", normalDoseMgMin: 5, normalDoseMgMax: 10 },
  { name: "doxycycline", normalDoseMgMin: 100, normalDoseMgMax: 200 },
  { name: "levothyroxine", normalDoseMgMin: 0.025, normalDoseMgMax: 0.3 },
];

export type ValidationResult = {
  flagged: boolean;
  flagReason?: string;
};

export function validateMedication(
  medicationName: string,
  dosageMg: number
): ValidationResult {
  const normalized = medicationName.trim().toLowerCase();
  const ref = DRUG_REFERENCE.find((d) => normalized.includes(d.name));

  if (!ref) {
    return {
      flagged: true,
      flagReason: `"${medicationName}" isn't in our reference list yet, please confirm this manually.`,
    };
  }

  if (dosageMg < ref.normalDoseMgMin || dosageMg > ref.normalDoseMgMax) {
    return {
      flagged: true,
      flagReason: `${dosageMg}mg is outside the typical range for ${ref.name} (${ref.normalDoseMgMin}-${ref.normalDoseMgMax}mg), please confirm the correct dose.`,
    };
  }

  return { flagged: false };
}