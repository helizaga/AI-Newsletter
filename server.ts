import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.get("/unsubscribe", async (req, res) => {
  try {
    const email = req.query.email as string;
    const userId = req.query.userId as string; // Assume you pass userId as a query parameter

    if (!email || !userId) {
      return res.status(400).send("Bad Request: Missing email or userId.");
    }

    // Fetch the current list of emails for the user
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (user && user.emailsToSendTo) {
      // Cast to the expected type and then use .filter()
      const updatedEmailsToSendTo = (user.emailsToSendTo as string[]).filter(
        (e) => e !== email
      );

      // Update the record in the database
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { emailsToSendTo: updatedEmailsToSendTo },
      });

      return res.status(200).send("Successfully unsubscribed.");
    } else {
      return res.status(404).send("User not found or no emails to send to.");
    }
  } catch (error) {
    console.error("Error in unsubscribe:", error);
    return res.status(500).send("Internal Server Error");
  }
});
