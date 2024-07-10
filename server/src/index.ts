import express, { Request, Response } from "express";
import adminRoutes from "./routes/adminRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";

import dotenv from "dotenv";
import { setupMiddleware } from "../config/middleware";
import { prisma } from "../db/prisma/prismaClient";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
setupMiddleware(app);

// Server initialization
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// API Endpoints
app.use("/api/admin", adminRoutes);
app.use("/api/newsletters", newsletterRoutes);
app.get("/unsubscribe", unsubscribeHandler);

// Handlers

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
