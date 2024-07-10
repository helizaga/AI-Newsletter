-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "id" SERIAL NOT NULL,
    "adminID" INTEGER NOT NULL,
    "searchTerm" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
