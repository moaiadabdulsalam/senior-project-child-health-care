/*
  Warnings:

  - You are about to drop the column `from` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `PasswordChange` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `sentAt` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_UPDATE_DATE', 'APPOINTMENT_BOOKED', 'APPOINTMENT_DELETED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'CHILD_LOGIN', 'MEDICINE_REMINDER', 'DOCTOR_DAY_IN', 'DOCTOR_VERIFIED', 'DOCTOR_REJECTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'CHILD_PROFILE_UPDATED', 'SYSTEM_ALERT');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- DropIndex
DROP INDEX IF EXISTS "Notification_userId_idx";

-- Existing rows: sentAt was nullable; NOT NULL would fail without backfill
UPDATE "Notification" SET "sentAt" = CURRENT_TIMESTAMP WHERE "sentAt" IS NULL;

-- AlterTable: NOT NULL type needs a default for existing rows; Prisma schema has no @default — drop it after
ALTER TABLE "Notification" DROP COLUMN IF EXISTS "from",
ADD COLUMN IF NOT EXISTS "data" JSONB,
ADD COLUMN IF NOT EXISTS "senderId" TEXT,
ADD COLUMN IF NOT EXISTS "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM_ALERT'::"NotificationType",
ALTER COLUMN "sentAt" SET NOT NULL,
ALTER COLUMN "sentAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Notification" ALTER COLUMN "type" DROP DEFAULT;

-- DropTable
DROP TABLE IF EXISTS "PasswordChange";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_senderId_idx" ON "Notification"("userId", "senderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
