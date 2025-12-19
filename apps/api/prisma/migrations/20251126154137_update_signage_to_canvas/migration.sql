-- Rename signages table to canvases
ALTER TABLE "signages" RENAME TO "canvases";

-- Rename signage_contents table to canvas_contents
ALTER TABLE "signage_contents" RENAME TO "canvas_contents";

-- Update foreign key column names in canvas_contents table
ALTER TABLE "canvas_contents" RENAME COLUMN "signageId" TO "canvasId";

-- Update foreign key column names in favorites table
ALTER TABLE "favorites" RENAME COLUMN "signageId" TO "canvasId";

-- Update foreign key column names in reports table
ALTER TABLE "reports" RENAME COLUMN "signageId" TO "canvasId";

-- Drop old unique constraint on favorites
ALTER TABLE "favorites" DROP CONSTRAINT IF EXISTS "favorites_userId_signageId_key";

-- Add new unique constraint on favorites
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_canvasId_key" UNIQUE ("userId", "canvasId");

-- Update indexes
DROP INDEX IF EXISTS "favorites_signageId_idx";
CREATE INDEX "favorites_canvasId_idx" ON "favorites"("canvasId");

DROP INDEX IF EXISTS "reports_signageId_idx";
CREATE INDEX "reports_canvasId_idx" ON "reports"("canvasId");

DROP INDEX IF EXISTS "canvas_contents_signageId_idx";
CREATE INDEX "canvas_contents_canvasId_idx" ON "canvas_contents"("canvasId");

DROP INDEX IF EXISTS "canvas_contents_signageId_position_idx";
CREATE INDEX "canvas_contents_canvasId_position_idx" ON "canvas_contents"("canvasId", "position");
