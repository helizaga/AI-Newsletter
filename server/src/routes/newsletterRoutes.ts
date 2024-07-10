import express, { Router } from "express";
import {
  regenerateNewsletterHandler,
  sendNewsletterHandler,
  getNewslettersHandler,
  deleteNewsletterHandler,
  createNewsletterHandler,
} from "../controllers/newsletterController";

const router: Router = express.Router();

// Route to regenerate newsletter content
router.post("/regenerate", regenerateNewsletterHandler);

// Route to send a newsletter
router.post("/send", sendNewsletterHandler);

// Route to get all newsletters for a particular admin
router.get("/", getNewslettersHandler);

// Route to delete a newsletter by its ID
router.delete("/:id", deleteNewsletterHandler);

// Route to create a new newsletter
router.post("/create", createNewsletterHandler);

export default router;
