/*
  Warnings:

  - The values [CONFIRMED] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `status` to the `Medication` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MedicationStatus" AS ENUM ('COMPLETED', 'CANCELLED', 'ACTIVE');

-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('NO_SHOW', 'CANCELLED', 'RESERVED', 'COMPLETED', 'PENDING');
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "status" "MedicationStatus" NOT NULL;
