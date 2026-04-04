/*
  Warnings:

  - You are about to drop the column `from` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the `PasswordChange` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Made the column `sentAt` on table `Notification` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_UPDATE_DATE', 'APPOINTMENT_BOOKED', 'APPOINTMENT_DELETED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'CHILD_LOGIN', 'MEDICINE_REMINDER', 'DOCTOR_DAY_IN', 'DOCTOR_VERIFIED', 'DOCTOR_REJECTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'CHILD_PROFILE_UPDATED', 'SYSTEM_ALERT');

-- DropIndex
DROP INDEX "Notification_userId_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "from",
ADD COLUMN     "data" JSONB,
ADD COLUMN     "senderId" TEXT,
ADD COLUMN     "type" "NotificationType" NOT NULL,
ALTER COLUMN "sentAt" SET NOT NULL,
ALTER COLUMN "sentAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "PasswordChange";

-- CreateIndex
CREATE INDEX "Notification_userId_senderId_idx" ON "Notification"("userId", "senderId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
