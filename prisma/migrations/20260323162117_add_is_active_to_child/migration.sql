/*
  Warnings:

  - The values [CUSTOM_HOUR] on the enum `ExceptionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExceptionType_new" AS ENUM ('DAY_OFF', 'CUSTOM_UNAVAILABLE_HOURS', 'CUSTOM_AVAILABLE_HOURS');
ALTER TABLE "Exception" ALTER COLUMN "type" TYPE "ExceptionType_new" USING ("type"::text::"ExceptionType_new");
ALTER TYPE "ExceptionType" RENAME TO "ExceptionType_old";
ALTER TYPE "ExceptionType_new" RENAME TO "ExceptionType";
DROP TYPE "public"."ExceptionType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "isActive" BOOLEAN DEFAULT true;
