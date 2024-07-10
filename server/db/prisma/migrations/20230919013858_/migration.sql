-- DropForeignKey
ALTER TABLE "NewsletterHistory" DROP CONSTRAINT "NewsletterHistory_newsletterId_fkey";

-- AddForeignKey
ALTER TABLE "NewsletterHistory" ADD CONSTRAINT "NewsletterHistory_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
