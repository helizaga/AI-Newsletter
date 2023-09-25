import { Request, Response } from "express";

import { prisma } from "../../db/prisma/prismaClient";

export async function getEmailsHandler(req: Request, res: Response) {
  const adminId = req.query.adminId;
  if (typeof adminId !== "string") {
    return res.status(400).json({ error: "Invalid email query parameter" });
  }
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });
  if (!admin) {
    return res.status(404).json({ error: "Admin not found" });
  }
  res.json({ mailingList: admin.mailingList });
}

export async function deleteSelectedEmailsHandler(req: Request, res: Response) {
  const { adminID, emailsToDelete } = req.body;

  if (!adminID) {
    return res.status(400).json({ error: "ID is missing from payload" });
  }
  if (!Array.isArray(emailsToDelete)) {
    return res.status(400).json({ error: "emailsToDelete is not an array" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminID },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (!admin || !Array.isArray(admin.mailingList)) {
      return res
        .status(404)
        .json({ error: "Admin not found or no emails to send to" });
    }

    // Filter out the emails to delete
    const updatedEmails = admin.mailingList.filter(
      (e) => !emailsToDelete.includes(e)
    );

    // Update the admin's emails
    await prisma.admin.update({
      where: { id: adminID },
      data: { mailingList: updatedEmails },
    });

    res.status(200).json({ message: "Successfully deleted selected emails" });
  } catch (error) {
    console.error("Error in delete-selected-emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function addEmailsHandler(req: Request, res: Response) {
  const { adminID, emailList } = req.body;

  if (!adminID || !Array.isArray(emailList)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminID },
    });

    if (!admin || !Array.isArray(admin.mailingList)) {
      return res
        .status(404)
        .json({ error: "Admin not found or no emails to send to" });
    }

    // Combine existing and new emails
    const updatedEmails = [...new Set([...admin.mailingList, ...emailList])];

    // Update the admin's emails
    await prisma.admin.update({
      where: { id: adminID },
      data: { mailingList: updatedEmails },
    });

    res
      .status(200)
      .json({ message: "Successfully added emails", updatedEmails });
  } catch (error) {
    console.error("Error in add-emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateAdminHandler(
  req: Request,
  res: Response
): Promise<void> {
  const { id, email, name } = req.body;

  if (id == null || email == null) {
    res.status(400).json({ message: "Invalid id or email" });
    return;
  }

  await prisma.admin.upsert({
    where: { id },
    update: { name, email },
    create: { id, name, email, mailingList: [email] },
  });

  res.status(200).json({ message: "Admin updated successfully" });
}
