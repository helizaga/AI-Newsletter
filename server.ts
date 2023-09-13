import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const port = 3000;
const prisma = new PrismaClient();

app.get("/unsubscribe", async (req, res) => {
  const email = req.query.email;
  const userId = req.query.userId; // Assume you pass userId as a query parameter

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

    res.status(200).send("Successfully unsubscribed.");
  } else {
    res.status(404).send("User not found or no emails to send to.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
