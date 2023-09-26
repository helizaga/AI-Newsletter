import { Request, Response } from "express";
import {
  generatePersonalizedContent,
  fetchUsedArticles,
  addUsedArticles,
} from "../dataProcessing";
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { configureAWS } from "../../config/awsConfig";

import { prisma } from "../../db/prisma/prismaClient";
const sesClient = configureAWS();

export async function createNewsletterHandler(req: Request, res: Response) {
  try {
    const { adminID, topic, reason } = req.body;
    console.log(adminID);
    const admin = await prisma.admin.findUnique({ where: { id: adminID } });
    if (admin) {
      // Fetch the set of used articles for this admin, topic, and reason
      const usedArticles = await fetchUsedArticles(adminID, topic, reason);
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
      await addUsedArticles(
        firstFourArticles,
        adminID,
        topic,
        reason,
        newsletter.id
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

export async function deleteNewsletterHandler(req: Request, res: Response) {
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

export async function getNewslettersHandler(req: Request, res: Response) {
  const adminId = req.query.adminId as string;
  if (!adminId)
    return res.status(400).json({ error: "Invalid id query parameter" });

  const newsletters = await prisma.newsletter.findMany({
    where: { adminID: adminId },
  });
  res.json(newsletters);
}

export async function regenerateNewsletterHandler(req: Request, res: Response) {
  const { newsletterId, adminID } = req.body;
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
    const usedArticles = await fetchUsedArticles(
      adminID,
      newsletter.topic,
      newsletter.reason
    );

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

    await addUsedArticles(
      firstFourArticles,
      adminID,
      newsletter.topic,
      newsletter.reason,
      newsletter.id
    );

    return res
      .status(200)
      .json({ message: "Newsletter content regenerated", updatedNewsletter });
  } catch (error) {
    console.error("Error in regenerate-newsletter:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function sendNewsletterHandler(req: Request, res: Response) {
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
