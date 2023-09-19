/*
  Warnings:

  - Made the column `userEmail` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userEmail" SET NOT NULL;
