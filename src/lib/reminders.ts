import { prisma } from "./prisma";
import type { ParsedMedication } from "./extraction";

export async function listReminders(patientId: string) {
  return prisma.reminder.findMany({
    where: { patientId },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function toggleReminder(id: string, patientId: string) {
  const reminder = await prisma.reminder.findFirst({ where: { id, patientId } });
  if (!reminder) throw new Error("Reminder not found");
  return prisma.reminder.update({
    where: { id },
    data: { enabled: !reminder.enabled },
  });
}

export async function createManualReminder(
  patientId: string,
  medication: string,
  dosage: string,
  scheduledAt: Date
) {
  return prisma.reminder.create({
    data: { patientId, medication, dosage, scheduledAt, enabled: true },
  });
}

function getTimeSlots(frequencyPerDay: number): { hour: number; minute: number }[] {
  const table: Record<number, { hour: number; minute: number }[]> = {
    1: [{ hour: 9, minute: 0 }],
    2: [{ hour: 9, minute: 0 }, { hour: 21, minute: 0 }],
    3: [{ hour: 8, minute: 0 }, { hour: 14, minute: 0 }, { hour: 20, minute: 0 }],
    4: [
      { hour: 8, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 16, minute: 0 },
      { hour: 20, minute: 0 },
    ],
  };
  return table[frequencyPerDay] || [{ hour: 9, minute: 0 }];
}

export async function createRemindersForMedication(
  patientId: string,
  documentId: string,
  med: ParsedMedication
) {
  const created = [];

  if (med.dosageMg != null) {
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 1);
    scheduledAt.setHours(9, 0, 0, 0);

    created.push(
      await prisma.reminder.create({
        data: {
          patientId,
          documentId,
          medication: med.name,
          dosage: med.dosageLabel,
          scheduledAt,
          flagged: med.flagged,
          flagReason: med.flagReason,
          enabled: !med.flagged,
        },
      })
    );
  } else if (med.frequencyPerDay != null) {
    const slots = getTimeSlots(med.frequencyPerDay);
    for (const slot of slots) {
      const scheduledAt = new Date();
      scheduledAt.setDate(scheduledAt.getDate() + 1);
      scheduledAt.setHours(slot.hour, slot.minute, 0, 0);

      created.push(
        await prisma.reminder.create({
          data: {
            patientId,
            documentId,
            medication: med.name,
            dosage: med.dosageLabel,
            scheduledAt,
            flagged: med.flagged,
            flagReason: med.flagReason,
            enabled: !med.flagged,
          },
        })
      );
    }
  }

  return created;
}