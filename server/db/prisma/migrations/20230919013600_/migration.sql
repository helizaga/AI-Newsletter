-- AlterTable
ALTER TABLE "Newsletter" ALTER COLUMN "title" SET DEFAULT 'Default Title',
ALTER COLUMN "content" SET DEFAULT 'Default Content',
ALTER COLUMN "sentDate" SET DEFAULT CURRENT_TIMESTAMP;
