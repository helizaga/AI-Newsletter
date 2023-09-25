/*
  Warnings:

  - The `mailingList` column on the `Admin` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Admin" DROP COLUMN "mailingList",
ADD COLUMN     "mailingList" TEXT[];
