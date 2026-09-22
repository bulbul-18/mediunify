import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentPatient() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const user = await currentUser();
  const name =
    user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
    "Patient";

  return prisma.patient.upsert({
    where: { authId: userId },
    update: { name },
    create: { authId: userId, name },
  });
}