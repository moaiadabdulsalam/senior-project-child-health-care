/*
  Warnings:

  - You are about to drop the column `photo` on the `Child` table. All the data in the column will be lost.
  - Added the required column `childAccessSessionId` to the `GameSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccessSessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AccessSessionSource" AS ENUM ('SAME_DEVICE', 'QR_DEVICE');

-- CreateEnum
CREATE TYPE "DeviceLinkStatus" AS ENUM ('PENDING', 'USED', 'EXPIRED', 'CANCELED');

-- AlterTable
ALTER TABLE "Child" DROP COLUMN "photo";

-- AlterTable
ALTER TABLE "GameSession" ADD COLUMN     "childAccessSessionId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ChildAccessSession" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "status" "AccessSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdFrom" "AccessSessionSource" NOT NULL,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildAccessSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceLinkRequest" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "status" "DeviceLinkStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceLinkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChildAccessSession_childId_status_idx" ON "ChildAccessSession"("childId", "status");

-- CreateIndex
CREATE INDEX "ChildAccessSession_parentId_status_idx" ON "ChildAccessSession"("parentId", "status");

-- CreateIndex
CREATE INDEX "ChildAccessSession_expiresAt_idx" ON "ChildAccessSession"("expiresAt");

-- CreateIndex
CREATE INDEX "DeviceLinkRequest_childId_status_idx" ON "DeviceLinkRequest"("childId", "status");

-- CreateIndex
CREATE INDEX "DeviceLinkRequest_expiresAt_idx" ON "DeviceLinkRequest"("expiresAt");

-- AddForeignKey
ALTER TABLE "ChildAccessSession" ADD CONSTRAINT "ChildAccessSession_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProfileParent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildAccessSession" ADD CONSTRAINT "ChildAccessSession_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLinkRequest" ADD CONSTRAINT "DeviceLinkRequest_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProfileParent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceLinkRequest" ADD CONSTRAINT "DeviceLinkRequest_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_childAccessSessionId_fkey" FOREIGN KEY ("childAccessSessionId") REFERENCES "ChildAccessSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
