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
app.post("/api/update-admin", updateAdminHandler);
app.post("/api/create-newsletter", createNewsletterHandler);
app.get("/api/get-newsletters", getNewslettersHandler);
app.get("/api/get-emails", getEmailsHandler);
app.post("/api/delete-selected-emails", deleteSelectedEmailsHandler);
app.delete("/api/delete-newsletter/:id", deleteNewsletterHandler);
app.post("/api/add-emails", addEmailsHandler);
app.post("/api/send-newsletter", sendNewsletterHandler);
app.post("/api/regenerate-newsletter", regenerateNewsletterHandler);

async function regenerateNewsletterHandler(req: Request, res: Response) {
  const { newsletterId, adminID } = req.body;
  console.log(newsletterId, adminID);
  if (!newsletterId || !adminID) {
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
        adminID: adminID,
        topic: newsletter.topic,
        reason: newsletter.reason,
      },
    });

    const usedArticleSet = new Set(usedArticles.map((article) => article.url));

    // Regenerate content using your existing logic.
    const { content, firstFourArticles } = await generatePersonalizedContent(
      newsletter.topic,
      newsletter.reason,
      adminID,
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
            adminID,
            newsletter.topic,
            newsletter.reason
          ))
        ) {
          return prisma.usedArticle.create({
            data: {
              url: article.url,
              newsletterId: Number(newsletterId),
              adminID: adminID,
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
      include: { admin: true },
    });

    if (!newsletter || !newsletter.admin || !newsletter.admin.mailingList) {
      return res.status(404).json({ error: "Newsletter or user not found" });
    }

    const toAddresses = newsletter.admin.mailingList as string[];

    const newsletterContent = newsletter.content; // Store the original content

    for (const recipientEmail of toAddresses) {
      // Generate a unique unsubscribe link for each recipient
      const unsubscribeLink = `http://127.0.0.1/unsubscribe?adminId=${
        newsletter.admin.id
      }&email=${encodeURIComponent(recipientEmail)}`;

      // Append the unsubscribe link to the newsletter content
      const personalizedContent = `${newsletterContent}\n\n[Unsubscribe](${unsubscribeLink})`;

      // Configure email parameters for this recipient
      const params = {
        Source: "tom.elizaga@gmail.com",
        Destination: {
          ToAddresses: [recipientEmail], // Single recipient
        },
        Message: {
          Subject: { Data: newsletter.title },
          Body: { Text: { Data: personalizedContent } },
        },
      };

      // Send email via AWS SES
      const sendEmailCommand = new SendEmailCommand(params);
      try {
        await sesClient.send(sendEmailCommand);
      } catch (err) {
        console.error(err);
      }

      return res.status(200).json({ message: "Newsletter sent successfully" });
    }
  } catch (error) {
    console.error("Error in send-newsletter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function getNewslettersHandler(req: Request, res: Response) {
  const adminId = req.query.adminId as string;
  if (!adminId)
    return res.status(400).json({ error: "Invalid id query parameter" });

  const newsletters = await prisma.newsletter.findMany({
    where: { adminID: adminId },
  });
  res.json(newsletters);
}

async function getEmailsHandler(req: Request, res: Response) {
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

async function unsubscribeHandler(
  req: Request,
  res: Response
): Promise<Response> {
  const email = req.query.email as string;
  const adminId = req.query.adminId as string;

  if (!email || !adminId) {
    return res
      .status(400)
      .json({ error: "Bad Request: Missing email or adminID." });
  }

  try {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (admin && admin.mailingList) {
      const emailsArray = admin.mailingList as string[]; // Type casting
      const updatedmailingList = emailsArray.filter((e) => e !== email);
      await prisma.admin.update({
        where: { id: adminId },
        data: { mailingList: updatedmailingList },
      });
      return res.status(200).json({ message: "Successfully unsubscribed." });
    }

    return res
      .status(404)
      .json({ error: "Admin not found or no emails to send to." });
  } catch (error) {
    console.error("Error in unsubscribe:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function updateAdminHandler(req: Request, res: Response): Promise<void> {
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

async function createNewsletterHandler(req: Request, res: Response) {
  try {
    const { adminID, topic, reason } = req.body;
    console.log(adminID);
    const admin = await prisma.admin.findUnique({ where: { id: adminID } });
    if (admin) {
      // Fetch the set of used articles for this admin, topic, and reason
      const usedArticles = await prisma.usedArticle.findMany({
        where: {
          adminID,
          topic,
          reason,
        },
      });
      const usedArticleSet = new Set(usedArticles.map((ua) => ua.url));
      const { content, optimalSearchQuery, firstFourArticles } =
        await generatePersonalizedContent(
          topic,
          reason,
          adminID,
          usedArticleSet
        );
      const newsletter = await prisma.newsletter.create({
        data: {
          adminID,
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
          if (!(await isArticleUsed(article.url, adminID, topic, reason))) {
            return prisma.usedArticle.create({
              data: {
                url: article.url,
                newsletterId: newsletter.id,
                adminID,
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
    return res.status(404).json({ error: "Admin not found" });
  } catch (error) {
    console.error("Error in create-newsletter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function addEmailsHandler(req: Request, res: Response) {
  console.log("Received payload:", req.body);

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
