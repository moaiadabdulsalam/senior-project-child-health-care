-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CHILD', 'PARENT', 'DOCTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('PENDING', 'VERIFYING', 'CONFIRMING');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ExceptionType" AS ENUM ('OFF', 'CUSTOM_HOUR');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'SYR');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('NO_SHOW', 'CANCELLED', 'COMPLETED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "MedicineUnit" AS ENUM ('ml', 'tablet', 'dose', 'drop');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileParent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileParent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileDoctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "speciality" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT NOT NULL,
    "clinicPhone" TEXT NOT NULL,
    "clinicAddress" TEXT,
    "clinicName" TEXT,
    "status" "DoctorStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileDoctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "bloodType" TEXT,
    "loginHandle" TEXT NOT NULL,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityPolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weeklyOffDays" "WeekDay"[],
    "startWork" TIMESTAMP(3) NOT NULL,
    "endWork" TIMESTAMP(3) NOT NULL,
    "slot" INTEGER NOT NULL,
    "breakStart" TIMESTAMP(3),
    "breakEnd" TIMESTAMP(3),
    "sessionPrice" DECIMAL(6,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exception" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "reason" TEXT,
    "type" "ExceptionType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exception_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "from" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(6,2) NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "currency" "Currency" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" JSONB,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "medicineUnit" "MedicineUnit" NOT NULL,
    "medicineAmount" TEXT NOT NULL,
    "Duration" TIMESTAMP(3) NOT NULL,
    "amountPerDay" TEXT NOT NULL,
    "firstDoseTime" TIMESTAMP(3) NOT NULL,
    "firstDoseDate" TIMESTAMP(3) NOT NULL,
    "rememberTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileParent_userId_key" ON "ProfileParent"("userId");

-- CreateIndex
CREATE INDEX "ProfileParent_userId_idx" ON "ProfileParent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileDoctor_userId_key" ON "ProfileDoctor"("userId");

-- CreateIndex
CREATE INDEX "ProfileDoctor_userId_speciality_idx" ON "ProfileDoctor"("userId", "speciality");

-- CreateIndex
CREATE INDEX "Child_fullName_parentId_idx" ON "Child"("fullName", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Child_fullName_parentId_key" ON "Child"("fullName", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilityPolicy_userId_key" ON "AvailabilityPolicy"("userId");

-- CreateIndex
CREATE INDEX "AvailabilityPolicy_slot_startWork_endWork_idx" ON "AvailabilityPolicy"("slot", "startWork", "endWork");

-- CreateIndex
CREATE INDEX "Exception_startTime_endTime_idx" ON "Exception"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_appointmentId_key" ON "Payment"("appointmentId");

-- CreateIndex
CREATE INDEX "Payment_appointmentId_parentId_idx" ON "Payment"("appointmentId", "parentId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_childId_parentId_idx" ON "Appointment"("doctorId", "childId", "parentId");

-- CreateIndex
CREATE INDEX "Medication_medicineName_childId_idx" ON "Medication"("medicineName", "childId");

-- AddForeignKey
ALTER TABLE "ProfileParent" ADD CONSTRAINT "ProfileParent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileDoctor" ADD CONSTRAINT "ProfileDoctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProfileParent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityPolicy" ADD CONSTRAINT "AvailabilityPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ProfileDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exception" ADD CONSTRAINT "Exception_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "ProfileDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProfileParent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "ProfileDoctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProfileParent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;
