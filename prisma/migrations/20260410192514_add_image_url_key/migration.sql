-- CreateEnum
CREATE TYPE "SlotFilterType" AS ENUM ('BOOKED', 'BREAK', 'AVAILABLE');

-- AlterEnum
ALTER TYPE "ExceptionType" ADD VALUE 'DAY_IN';

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ProfileDoctor" ADD COLUMN     "certificateKey" TEXT,
ADD COLUMN     "certificateUrl" TEXT,
ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "ProfileParent" ADD COLUMN     "imageKey" TEXT,
ADD COLUMN     "imageUrl" TEXT;
