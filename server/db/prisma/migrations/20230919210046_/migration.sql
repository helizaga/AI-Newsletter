/*
  Warnings:

  - You are about to drop the `NewsletterHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NewsletterHistory" DROP CONSTRAINT "NewsletterHistory_newsletterId_fkey";

-- DropTable
DROP TABLE "NewsletterHistory";

-- CreateTable
CREATE TABLE "ContentHistory" (
    "id" SERIAL NOT NULL,
    "newsletterId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContentHistory" ADD CONSTRAINT "ContentHistory_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
