/*
  Warnings:

  - The values [APPOINTMENT_BOOKED,MEDICINE_REMINDER] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `Duration` on the `Medication` table. All the data in the column will be lost.
  - You are about to drop the column `rememberTime` on the `Medication` table. All the data in the column will be lost.
  - Added the required column `duration` to the `Medication` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `amountPerDay` on the `Medication` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('APPOINTMENT_UPDATE_DATE', 'APPOINTMENT_REMINDER', 'APPOINTMENT_DELETED', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'CHILD_LOGIN', 'MEDICATION_REMINDER', 'DOCTOR_IN_EXCEPTION', 'DOCTOR_DAY_IN', 'DOCTOR_VERIFIED', 'DOCTOR_REJECTED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'CHILD_PROFILE_UPDATED', 'SYSTEM_ALERT');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable Medication: RENAME preserves row values (ADD duration NOT NULL would fill existing rows with NULL and fail 23502).
ALTER TABLE "Medication" DROP COLUMN IF EXISTS "rememberTime";
ALTER TABLE "Medication" RENAME COLUMN "Duration" TO "duration";
ALTER TABLE "Medication" ADD COLUMN IF NOT EXISTS "rememberNotify" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Medication" ALTER COLUMN "amountPerDay" SET DATA TYPE INTEGER USING (
  CASE
    WHEN trim("amountPerDay"::text) ~ '^[0-9]+$' THEN trim("amountPerDay"::text)::integer
    ELSE 1
  END
);

-- CreateTable
CREATE TABLE "MedicationDose" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "reminderSent" BOOLEAN NOT NULL DEFAULT false,
    "taken" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationDose_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MedicationDose_scheduledAt_medicationId_idx" ON "MedicationDose"("scheduledAt", "medicationId");

-- CreateIndex
CREATE UNIQUE INDEX "MedicationDose_medicationId_scheduledAt_key" ON "MedicationDose"("medicationId", "scheduledAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Appointment_date_reminderSent_idx" ON "Appointment"("date", "reminderSent");

-- CreateIndex
CREATE INDEX "Medication_firstDoseDate_firstDoseTime_idx" ON "Medication"("firstDoseDate", "firstDoseTime");

-- AddForeignKey
ALTER TABLE "MedicationDose" ADD CONSTRAINT "MedicationDose_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
