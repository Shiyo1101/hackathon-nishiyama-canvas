/*
  Warnings:

  - Made the column `reporterUserId` on table `reports` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "ContentType" ADD VALUE 'weather';

-- DropForeignKey
ALTER TABLE "public"."reports" DROP CONSTRAINT "reports_reporterUserId_fkey";

-- AlterTable
ALTER TABLE "reports" ALTER COLUMN "reporterUserId" SET NOT NULL;

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fontFamily" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "themes_name_idx" ON "themes"("name");

-- CreateIndex
CREATE INDEX "themes_isDefault_idx" ON "themes"("isDefault");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterUserId_fkey" FOREIGN KEY ("reporterUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
