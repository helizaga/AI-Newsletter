import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generatePersonalizedContent } from "../dataProcessing";

const prisma = new PrismaClient();

// Handler to create a new newsletter
export const createNewsletter = async (req: Request, res: Response) => {
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
};
