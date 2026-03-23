/*
  Warnings:

  - The values [OFF] on the enum `ExceptionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExceptionType_new" AS ENUM ('DAY_OFF', 'CUSTOM_HOUR');
ALTER TABLE "Exception" ALTER COLUMN "type" TYPE "ExceptionType_new" USING ("type"::text::"ExceptionType_new");
ALTER TYPE "ExceptionType" RENAME TO "ExceptionType_old";
ALTER TYPE "ExceptionType_new" RENAME TO "ExceptionType";
DROP TYPE "public"."ExceptionType_old";
COMMIT;

-- DropIndex
DROP INDEX "Exception_startTime_endTime_idx";

-- DropIndex
DROP INDEX "Payment_appointmentId_parentId_idx";

-- CreateIndex
CREATE INDEX "Exception_doctorId_startTime_endTime_idx" ON "Exception"("doctorId", "startTime", "endTime");

-- CreateIndex
CREATE INDEX "Payment_doctorId_appointmentId_parentId_idx" ON "Payment"("doctorId", "appointmentId", "parentId");
