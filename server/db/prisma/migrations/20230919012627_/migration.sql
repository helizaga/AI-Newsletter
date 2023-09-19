-- DropForeignKey
ALTER TABLE "UsedArticle" DROP CONSTRAINT "UsedArticle_newsletterId_fkey";

-- AddForeignKey
ALTER TABLE "UsedArticle" ADD CONSTRAINT "UsedArticle_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
