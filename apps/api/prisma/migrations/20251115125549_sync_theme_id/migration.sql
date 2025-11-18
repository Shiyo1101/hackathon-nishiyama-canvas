-- DropIndex
DROP INDEX "signages_userId_key";

-- AlterTable
ALTER TABLE "signages" ADD COLUMN     "themeId" TEXT;

-- CreateIndex
CREATE INDEX "signages_themeId_idx" ON "signages"("themeId");

-- AddForeignKey
ALTER TABLE "signages" ADD CONSTRAINT "signages_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
