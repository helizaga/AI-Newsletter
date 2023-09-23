/*
  Warnings:

  - A unique constraint covering the columns `[url,adminID,topic,reason]` on the table `UsedArticle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UsedArticle_url_adminID_topic_reason_key" ON "UsedArticle"("url", "adminID", "topic", "reason");
