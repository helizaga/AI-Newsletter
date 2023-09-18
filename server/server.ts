import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { generatePersonalizedContent } from "./dataProcessing";

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Server Listener
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Routes
app.get("/unsubscribe", unsubscribeHandler);
app.post("/api/update-user", updateUserHandler);
app.route("/api/create-newsletter").post(createNewsletterHandler);

// Handlers
async function unsubscribeHandler(
  req: Request,
  res: Response
): Promise<Response> {
  const email = req.query.email as string;
  const userId = req.query.userId as string;

  if (!email || !userId) {
    return res
      .status(400)
      .json({ error: "Bad Request: Missing email or userId." });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (user && user.emailsToSendTo) {
      const emailsArray = user.emailsToSendTo as string[]; // Type casting
      const updatedEmailsToSendTo = emailsArray.filter((e) => e !== email);
      await prisma.user.update({
        where: { id: Number(userId) },
        data: { emailsToSendTo: updatedEmailsToSendTo },
      });
      return res.status(200).json({ message: "Successfully unsubscribed." });
    }

    return res
      .status(404)
      .json({ error: "User not found or no emails to send to." });
  } catch (error) {
    console.error("Error in unsubscribe:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateUserHandler(req: Request, res: Response): Promise<void> {
  const { email, name } = req.body;

  await prisma.user.upsert({
    where: { userEmail: email },
    update: { name },
    create: { userEmail: email, name, emailsToSendTo: [email] },
  });

  res.status(200).json({ message: "User updated successfully" });
}

async function createNewsletterHandler(req: Request, res: Response) {
  try {
    const { email, topic, reason } = req.body;
    const user = await prisma.user.findUnique({ where: { userEmail: email } });
    if (user) {
      const content = await generatePersonalizedContent(topic, reason, user.id);
      return res.status(200).json({ message: "Newsletter created", content });
    }
    return res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.error("Error in create-newsletter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

app.post("/api/create-newsletter", async (req: Request, res: Response) => {
  const { email, topic, reason } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { userEmail: email } });
    if (user) {
      const content = await generatePersonalizedContent(topic, reason, user.id);
      res.status(200).json({ message: "Newsletter created", content });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error in create-newsletter:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
