/*
  Warnings:

  - The values [PENDING] on the enum `DoctorStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `role` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'ABANDONED');

-- AlterEnum
BEGIN;
CREATE TYPE "DoctorStatus_new" AS ENUM ('REJECTED', 'VERIFYING', 'CONFIRMING');
ALTER TABLE "ProfileDoctor" ALTER COLUMN "status" TYPE "DoctorStatus_new" USING ("status"::text::"DoctorStatus_new");
ALTER TYPE "DoctorStatus" RENAME TO "DoctorStatus_old";
ALTER TYPE "DoctorStatus_new" RENAME TO "DoctorStatus";
DROP TYPE "public"."DoctorStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "role" "Role" NOT NULL;

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "minAge" INTEGER,
    "maxAge" INTEGER,
    "difficultyLevel" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSession" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3) NOT NULL,
    "durationSeconds" INTEGER,
    "score" INTEGER,
    "levelReached" INTEGER,
    "status" "GameSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Game_title_category_idx" ON "Game"("title", "category");

-- CreateIndex
CREATE UNIQUE INDEX "Game_title_key" ON "Game"("title");

-- CreateIndex
CREATE INDEX "GameSession_childId_gameId_idx" ON "GameSession"("childId", "gameId");

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
