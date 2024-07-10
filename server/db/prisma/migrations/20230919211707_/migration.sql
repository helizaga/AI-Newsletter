/*
  Warnings:

  - Added the required column `reason` to the `UsedArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `UsedArticle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `adminID` to the `UsedArticle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UsedArticle" ADD COLUMN     "reason" TEXT NOT NULL,
ADD COLUMN     "topic" TEXT NOT NULL,
ADD COLUMN     "adminID" TEXT NOT NULL;
