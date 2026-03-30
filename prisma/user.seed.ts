import { PrismaPg } from '@prisma/adapter-pg';
import { DoctorStatus, PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import 'dotenv/config';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({ connectionString });

const adapter = new PrismaPg(pool as any);

const prisma = new PrismaClient({ adapter });

async function main() {
  const emailParent = 'dada@gmail.com';
  const password = '12345678';
  const passwordHash = await bcrypt.hash(password, 10);

  const emailDoctor = 'doctor@gmail.com';
  const passwordDoctor = '12345678';
  const passwordHashDoctory = await bcrypt.hash(passwordDoctor, 10);

  const parent = await prisma.user.upsert({
    where: { email: emailParent },
    update: {
      email: emailParent,
      passwordHash,
      role: Role.PARENT,
    },
    create: {
      email: emailParent,
      passwordHash,
      role: Role.PARENT,
    },
  });
  const doctor = await prisma.user.upsert({
    where: { email: emailDoctor },
    update: {
      email: emailDoctor,
      passwordHash: passwordHashDoctory,
      role: Role.DOCTOR,
    },
    create: {
      email: emailDoctor,
      passwordHash: passwordHashDoctory,
      role: Role.DOCTOR,
    },
  });

  // profileDoctor.userId is UNIQUE, so we must upsert to avoid duplicate constraint errors.
  await prisma.profileDoctor.upsert({
    where: { userId: doctor.id },
    update: {
      fullName: 'Dr. John Smith',
      fullNameArabic: 'د. جون سميث',
      speciality: 'Pediatrician',
      specialityArabic: 'طب الأطفال',
      description: 'Expert in child healthcare with 10+ years experience',
      phone: '0900000001',
      clinicPhone: '0211111111',
      clinicAddress: 'Istanbul - Pendik',
      clinicAddressArabic: 'اسطنبول - بندك',
      clinicName: 'Healthy Kids Clinic',
      clinicNameArabic: 'عيادة الأطفال السعداء',
      status: DoctorStatus.CONFIRMING,
    },
    create: {
      userId: doctor.id,
      fullName: 'Dr. John Smith',
      fullNameArabic: 'د. جون سميث',
      speciality: 'Pediatrician',
      specialityArabic: 'طب الأطفال',
      description: 'Expert in child healthcare with 10+ years experience',
      phone: '0900000001',
      clinicPhone: '0211111111',
      clinicAddress: 'Istanbul - Pendik',
      clinicAddressArabic: 'اسطنبول - بندك',
      clinicName: 'Healthy Kids Clinic',
      clinicNameArabic: 'عيادة الأطفال السعداء',
      status: DoctorStatus.CONFIRMING,
    },
  });
  console.log('✅ Seed completed successfully!');
  console.log(`User created/updated: ${parent.email} (${parent.role})`);
  console.log(`User created/updated: ${doctor.email} (${doctor.role})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
