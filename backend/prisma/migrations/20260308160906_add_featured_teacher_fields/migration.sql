-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "featuredOrder" INTEGER,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "landingBio" TEXT;

-- CreateIndex
CREATE INDEX "Teacher_isFeatured_featuredOrder_idx" ON "Teacher"("isFeatured", "featuredOrder");
