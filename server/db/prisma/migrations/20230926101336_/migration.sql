/*
  Warnings:

  - A unique constraint covering the columns `[topic,reason]` on the table `Newsletter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Newsletter_topic_reason_key" ON "Newsletter"("topic", "reason");
