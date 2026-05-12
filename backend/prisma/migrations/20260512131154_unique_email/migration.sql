/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Emails` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Emails_email_key" ON "Emails"("email");
