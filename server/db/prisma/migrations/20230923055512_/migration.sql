/*
  Warnings:

  - You are about to drop the column `adminID` on the `Newsletter` table. All the data in the column will be lost.
  - You are about to drop the column `adminID` on the `UsedArticle` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[url,adminID,topic,reason]` on the table `UsedArticle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminID` to the `Newsletter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adminID` to the `UsedArticle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Newsletter" DROP CONSTRAINT "Newsletter_adminID_fkey";

-- DropIndex
DROP INDEX "UsedArticle_url_adminID_topic_reason_key";

-- AlterTable
ALTER TABLE "Newsletter" DROP COLUMN "adminID",
ADD COLUMN     "adminID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UsedArticle" DROP COLUMN "adminID",
ADD COLUMN     "adminID" TEXT NOT NULL;

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "mailingList" JSONB NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UsedArticle_url_adminID_topic_reason_key" ON "UsedArticle"("url", "adminID", "topic", "reason");

-- AddForeignKey
ALTER TABLE "Newsletter" ADD CONSTRAINT "Newsletter_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
