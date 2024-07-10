import express from "express";
import {
  getEmailsHandler,
  deleteSelectedEmailsHandler,
  addEmailsHandler,
  updateAdminHandler,
} from "../controllers/adminController";

const router = express.Router();

router.get("/emails", getEmailsHandler);
router.delete("/emails/", deleteSelectedEmailsHandler);
router.post("/emails/add", addEmailsHandler);
router.post("/update", updateAdminHandler);

export default router;
