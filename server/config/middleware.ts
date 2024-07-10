import express from "express";
import cors from "cors";

export function setupMiddleware(app: express.Application) {
  app.use(express.json());
  app.use(cors());
}
