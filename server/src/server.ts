import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import { generatePersonalizedContent, isArticleUsed } from "./dataProcessing";
import dotenv from "dotenv";
import { SESClient } from "@aws-sdk/client-ses";
import { SendEmailCommand } from "@aws-sdk/client-ses";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// Server initialization
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const sesConfig = {
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
};
const sesClient = new SESClient(sesConfig);

// API Endpoints
app.get("/unsubscribe", unsubscribeHandler);
app.post("/api/update-user", updateUserHandler);
app.post("/api/create-newsletter", createNewsletterHandler);
app.get("/api/get-newsletters", getNewslettersHandler);
app.get("/api/get-emails", getEmailsHandler);
app.post("/api/delete-selected-emails", deleteSelectedEmailsHandler);
app.delete("/api/delete-newsletter/:id", deleteNewsletterHandler);
app.post("/api/add-emails", addEmailsHandler);
app.post("/api/send-newsletter", sendNewsletterHandler);
app.post("/api/regenerate-newsletter", regenerateNewsletterHandler);

async function regenerateNewsletterHandler(req: Request, res: Response) {
  const { newsletterId, userId } = req.body;
  console.log(newsletterId, userId);
  if (!newsletterId || !userId) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: Number(newsletterId) },
      include: { contentHistory: true },
    });

    if (!newsletter) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    const usedArticles = await prisma.usedArticle.findMany({
      where: {
        userId: userId,
        topic: newsletter.topic,
        reason: newsletter.reason,
      },
    });

    const usedArticleSet = new Set(usedArticles.map((article) => article.url));

    // Regenerate content using your existing logic.
    const { content, firstFourArticles } = await generatePersonalizedContent(
      newsletter.topic,
      newsletter.reason,
      userId,
      usedArticleSet // Pass this as an additional parameter
    );

    // Update the content history and regenerateCount
    const updatedNewsletter = await prisma.newsletter.update({
      where: { id: Number(newsletterId) },
      data: {
        content: content,
        contentHistory: {
          create: { content: content },
        },
        regenerateCount: {
          increment: 1,
        },
      },
    });

    await Promise.all(
      firstFourArticles.map(async (article) => {
        if (
          !(await isArticleUsed(
            article.url,
            userId,
            newsletter.topic,
            newsletter.reason
          ))
        ) {
          return prisma.usedArticle.create({
            data: {
              url: article.url,
              newsletterId: Number(newsletterId),
              userId: userId,
              topic: newsletter.topic,
              reason: newsletter.reason,
              createdAt: new Date(),
            },
          });
        }
      })
    );

    return res
      .status(200)
      .json({ message: "Newsletter content regenerated", updatedNewsletter });
  } catch (error) {
    console.error("Error in regenerate-newsletter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Handlers
async function sendNewsletterHandler(req: Request, res: Response) {
  console.log("Received in sendNewsletterHandler:", req.body);

  const { newsletterId } = req.body;

  if (!newsletterId) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    // Fetch the newsletter content and user information using Prisma
    const newsletter = await prisma.newsletter.findUnique({
      where: { id: Number(newsletterId) },
      include: { user: true },
    });

    if (!newsletter || !newsletter.user || !newsletter.user.emailsToSendTo) {
      return res.status(404).json({ error: "Newsletter or user not found" });
    }

    const toAddresses = newsletter.user.emailsToSendTo as string[];

    // Configure email parameters
    const params = {
      Source: "tom.elizaga@gmail.com",
      Destination: {
        ToAddresses: toAddresses,
      },
      Message: {
        Subject: { Data: newsletter.title },
        Body: { Text: { Data: newsletter.content } },
      },
    };

    // Send email via AWS SES
    try {
      const sendEmailCommand = new SendEmailCommand(params);
      try {
        const data = await sesClient.send(sendEmailCommand);
        return res
          .status(200)
          .json({ message: "Newsletter sent successfully", data });
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to send email" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error in send-newsletter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getNewslettersHandler(req: Request, res: Response) {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: "Invalid id query parameter" });

  const newsletters = await prisma.newsletter.findMany({
    where: { user: { id } },
  });
  res.json(newsletters);
}

async function getEmailsHandler(req: Request, res: Response) {
  const id = req.query.id;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid email query parameter" });
  }
  const user = await prisma.user.findUnique({
    where: { id: id },
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json({ emailsToSendTo: user.emailsToSendTo });
}

async function deleteNewsletterHandler(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.newsletter.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ message: "Successfully deleted newsletter" });
  } catch (error) {
    console.error("Error in delete-newsletter:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function deleteSelectedEmailsHandler(req: Request, res: Response) {
  const { id, emailsToDelete } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID is missing from payload" });
  }
  if (!Array.isArray(emailsToDelete)) {
    return res.status(400).json({ error: "emailsToDelete is not an array" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user || !Array.isArray(user.emailsToSendTo)) {
      return res
        .status(404)
        .json({ error: "User not found or no emails to send to" });
    }

    // Filter out the emails to delete
    const updatedEmails = user.emailsToSendTo.filter(
      (e) => !emailsToDelete.includes(e)
    );

    // Update the user's emails
    await prisma.user.update({
      where: { id: id },
      data: { emailsToSendTo: updatedEmails },
    });

    res.status(200).json({ message: "Successfully deleted selected emails" });
  } catch (error) {
    console.error("Error in delete-selected-emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

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
      where: { id: userId },
    });

    if (user && user.emailsToSendTo) {
      const emailsArray = user.emailsToSendTo as string[]; // Type casting
      const updatedEmailsToSendTo = emailsArray.filter((e) => e !== email);
      await prisma.user.update({
        where: { id: userId },
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
  const { id, email, name } = req.body;

  if (id == null || email == null) {
    res.status(400).json({ message: "Invalid id or email" });
    return;
  }

  await prisma.user.upsert({
    where: { id: id },
    update: { name, userEmail: email },
    create: { id: id, name, userEmail: email, emailsToSendTo: [email] },
  });

  res.status(200).json({ message: "User updated successfully" });
}

async function createNewsletterHandler(req: Request, res: Response) {
  try {
    const { id, topic, reason } = req.body;
    const user = await prisma.user.findUnique({ where: { id: id } });
    if (user) {
      // Fetch the set of used articles for this user, topic, and reason
      const usedArticles = await prisma.usedArticle.findMany({
        where: {
          userId: user.id,
          topic: topic,
          reason: reason,
        },
      });
      const usedArticleSet = new Set(usedArticles.map((ua) => ua.url));
      const { content, optimalSearchQuery, firstFourArticles } =
        await generatePersonalizedContent(
          topic,
          reason,
          user.id,
          usedArticleSet
        );
      const newsletter = await prisma.newsletter.create({
        data: {
          userId: user.id,
          topic: topic,
          reason: reason,
          title: `Newsletter: ${optimalSearchQuery} - ${new Date().toISOString()}`,
          searchQuery: optimalSearchQuery,
          content: content,
          contentHistory: {
            create: { content: content },
          },
        },
      });

      // Update the UsedArticle table with certain conditions. i don't want this updated when an article is seen before by the same admin for the same topic and reason.
      await Promise.all(
        firstFourArticles.map(async (article) => {
          if (!(await isArticleUsed(article.url, user.id, topic, reason))) {
            return prisma.usedArticle.create({
              data: {
                url: article.url,
                newsletterId: newsletter.id,
                userId: user.id,
                topic: topic,
                reason: reason,
                createdAt: new Date(),
              },
            });
          }
        })
      );

      console.log(
        "Created new newsletter from createNewsletterHandler: ",
        newsletter
      );
      return res.status(200).json({ message: "Newsletter created", content });
    }
    return res.status(404).json({ error: "User not found" });
  } catch (error) {
    console.error("Error in create-newsletter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addEmailsHandler(req: Request, res: Response) {
  console.log("Received payload:", req.body);

  const { id, emailList } = req.body;

  if (!id || !Array.isArray(emailList)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user || !Array.isArray(user.emailsToSendTo)) {
      return res
        .status(404)
        .json({ error: "User not found or no emails to send to" });
    }

    // Combine existing and new emails
    const updatedEmails = [...new Set([...user.emailsToSendTo, ...emailList])];

    // Update the user's emails
    await prisma.user.update({
      where: { id: id },
      data: { emailsToSendTo: updatedEmails },
    });

    res
      .status(200)
      .json({ message: "Successfully added emails", updatedEmails });
  } catch (error) {
    console.error("Error in add-emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
