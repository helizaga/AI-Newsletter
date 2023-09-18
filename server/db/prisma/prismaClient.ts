import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

export async function importEmailList(
  userId: number,
  newEmailList: string[]
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user) {
    await prisma.user.update({
      where: { id: userId },
      data: { emailsToSendTo: newEmailList },
    });
    console.log("Email list imported successfully.");
  } else {
    console.log("User not found.");
  }
}

export async function addSingleEmail(
  userId: number,
  newEmail: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user && user.emailsToSendTo) {
    if (Array.isArray(user.emailsToSendTo)) {
      // Explicitly check if it's an array
      const updatedEmailsToSendTo = [...user.emailsToSendTo, newEmail];
      await prisma.user.update({
        where: { id: userId },
        data: { emailsToSendTo: updatedEmailsToSendTo },
      });
      console.log("New email added successfully.");
    } else {
      console.log("emailsToSendTo is not an array.");
    }
  } else {
    console.log("User not found or emailsToSendTo is null.");
  }
}
