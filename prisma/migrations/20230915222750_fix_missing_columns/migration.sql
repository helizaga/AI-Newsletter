/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Preference` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reason` to the `Newsletter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `searchTerm` to the `Newsletter` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailsToSendTo` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userEmail` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_userId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Newsletter" ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "searchTerm" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "emailsToSendTo" JSONB NOT NULL,
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- DropTable
DROP TABLE "Preference";

-- CreateIndex
CREATE UNIQUE INDEX "User_userEmail_key" ON "User"("userEmail");
