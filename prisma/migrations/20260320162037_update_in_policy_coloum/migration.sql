/*
  Warnings:

  - You are about to drop the column `userId` on the `AvailabilityPolicy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[doctorId]` on the table `AvailabilityPolicy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctorId` to the `AvailabilityPolicy` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AvailabilityPolicy" DROP CONSTRAINT "AvailabilityPolicy_userId_fkey";

-- DropIndex
DROP INDEX "AvailabilityPolicy_userId_key";

-- AlterTable
ALTER TABLE "AvailabilityPolicy" DROP COLUMN "userId",
ADD COLUMN     "doctorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityPolicy_doctorId_key" ON "AvailabilityPolicy"("doctorId");

-- AddForeignKey
ALTER TABLE "AvailabilityPolicy" ADD CONSTRAINT "AvailabilityPolicy_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "ProfileDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
