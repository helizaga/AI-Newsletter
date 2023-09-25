/*
  Warnings:

  - A unique constraint covering the columns `[url,adminID,topic,reason]` on the table `UsedArticle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reason` to the `UsedArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `UsedArticle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "UsedArticle_adminID_idx";

-- DropIndex
DROP INDEX "UsedArticle_url_adminID_key";

-- AlterTable
ALTER TABLE "UsedArticle" ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "topic" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "UsedArticle_adminID_topic_reason_idx" ON "UsedArticle"("adminID", "topic", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "UsedArticle_url_adminID_topic_reason_key" ON "UsedArticle"("url", "adminID", "topic", "reason");
