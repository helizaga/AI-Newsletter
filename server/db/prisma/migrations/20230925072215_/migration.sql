/*
  Warnings:

  - You are about to drop the column `reason` on the `UsedArticle` table. All the data in the column will be lost.
  - You are about to drop the column `topic` on the `UsedArticle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url,adminID]` on the table `UsedArticle` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UsedArticle_adminID_topic_reason_idx";

-- DropIndex
DROP INDEX "UsedArticle_url_adminID_topic_reason_key";

-- AlterTable
ALTER TABLE "UsedArticle" DROP COLUMN "reason",
DROP COLUMN "topic";

-- CreateIndex
CREATE INDEX "UsedArticle_adminID_idx" ON "UsedArticle"("adminID");

-- CreateIndex
CREATE UNIQUE INDEX "UsedArticle_url_adminID_key" ON "UsedArticle"("url", "adminID");
