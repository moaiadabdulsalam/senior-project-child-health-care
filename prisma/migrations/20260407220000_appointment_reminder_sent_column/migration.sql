-- Ensures Appointment.reminderSent exists when DB is behind Prisma schema (e.g. partial deploy).
ALTER TABLE "Appointment" ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "Appointment_date_reminderSent_idx" ON "Appointment"("date", "reminderSent");
