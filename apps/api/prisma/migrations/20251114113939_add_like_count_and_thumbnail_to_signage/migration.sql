-- AlterTable
ALTER TABLE "signages" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateIndex
CREATE INDEX "signages_likeCount_idx" ON "signages"("likeCount" DESC);
