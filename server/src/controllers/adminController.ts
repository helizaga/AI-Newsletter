import { Request, Response } from "express";

import { prisma } from "../../db/prisma/prismaClient";

/**
 * Handles the request to get emails for a specific admin.
 *
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 * @return {Promise<void>} json response with the mailing list of the admin
 */
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
/**
 * Deletes selected emails based on the admin ID and emails to delete provided in the request body.
 *
 * @param {Request} req - the request object containing adminID and emailsToDelete
 * @param {Response} res - the response object to send back the result
 * @return {Promise<void>} A Promise that resolves when the emails are successfully deleted
 */
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

/**
 * Asynchronous function to handle the addition of emails to an admin's mailing list.
 *
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 * @return {Promise<void>} Promise that resolves with the result of the operation
 */
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

/**
 * Updates an admin's information in the database.
 *
 * @param {Request} req - the request object
 * @param {Response} res - the response object
 * @return {Promise<void>} a Promise that resolves once the admin is updated
 */
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
