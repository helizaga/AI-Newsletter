/*
  Warnings:

  - Added the required column `summaryID` to the `UsedArticle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UsedArticle" ADD COLUMN     "summaryID" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ArticleSummary" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT NOT NULL,

    CONSTRAINT "ArticleSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArticleSummary_url_key" ON "ArticleSummary"("url");

-- AddForeignKey
ALTER TABLE "UsedArticle" ADD CONSTRAINT "UsedArticle_summaryID_fkey" FOREIGN KEY ("summaryID") REFERENCES "ArticleSummary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
