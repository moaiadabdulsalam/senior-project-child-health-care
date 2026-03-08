-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "fullNameArabic" TEXT;

-- AlterTable
ALTER TABLE "Medication" ADD COLUMN     "mdeicineNameArabic" TEXT;

-- AlterTable
ALTER TABLE "ProfileDoctor" ADD COLUMN     "clinicAddressArabic" TEXT,
ADD COLUMN     "clinicNameArabic" TEXT,
ADD COLUMN     "fullNameArabic" TEXT,
ADD COLUMN     "specialityArabic" TEXT,
ALTER COLUMN "clinicPhone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProfileParent" ADD COLUMN     "addressArabic" TEXT,
ADD COLUMN     "fullNameArabic" TEXT;

-- CreateTable
CREATE TABLE "PasswordChange" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PasswordChange_email_idx" ON "PasswordChange"("email");
