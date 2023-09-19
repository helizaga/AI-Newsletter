-- CreateTable
CREATE TABLE "NewsletterHistory" (
    "id" SERIAL NOT NULL,
    "newsletterId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "sentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsletterHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NewsletterHistory" ADD CONSTRAINT "NewsletterHistory_newsletterId_fkey" FOREIGN KEY ("newsletterId") REFERENCES "Newsletter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
