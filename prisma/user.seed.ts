import { PrismaPg } from '@prisma/adapter-pg';
import {
  AppointmentStatus,
  Currency,
  DoctorStatus,
  ExceptionType,
  GameSessionStatus,
  Gender,
  MedicineUnit,
  MedicationStatus,
  PaymentStatus,
  PrismaClient,
  Role,
  WeekDay,
} from '@prisma/client';
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
  const passwordHash = await bcrypt.hash('12345678', 10);

  /**
   * 1) USERS
   */
  const parentUser = await prisma.user.upsert({
    where: { email: 'parent@gmail.com' },
    update: {
      passwordHash,
      role: Role.PARENT,
      isActive: true,
    },
    create: {
      email: 'parent@gmail.com',
      passwordHash,
      role: Role.PARENT,
      isActive: true,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@gmail.com' },
    update: {
      passwordHash,
      role: Role.DOCTOR,
      isActive: true,
    },
    create: {
      email: 'doctor@gmail.com',
      passwordHash,
      role: Role.DOCTOR,
      isActive: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
    create: {
      email: 'admin@gmail.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  /**
   * 2) PARENT PROFILE
   */
  const parentProfile = await prisma.profileParent.upsert({
    where: { userId: parentUser.id },
    update: {
      fullName: 'Ahmad Ali',
      fullNameArabic: 'أحمد علي',
      phone: '0900000000',
      address: 'Istanbul / Pendik',
      addressArabic: 'اسطنبول / بندك',
    },
    create: {
      userId: parentUser.id,
      fullName: 'Ahmad Ali',
      fullNameArabic: 'أحمد علي',
      phone: '0900000000',
      address: 'Istanbul / Pendik',
      addressArabic: 'اسطنبول / بندك',
    },
  });

  /**
   * 3) DOCTOR PROFILE
   */
  const doctorProfile = await prisma.profileDoctor.upsert({
    where: { userId: doctorUser.id },
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
      userId: doctorUser.id,
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

  /**
   * 4) CHILDREN
   */
  const child1 = await prisma.child.upsert({
    where: {
      fullName_parentId: {
        fullName: 'Omar Ahmad',
        parentId: parentProfile.id,
      },
    },
    update: {
      fullNameArabic: 'عمر أحمد',
      gender: Gender.Male,
      birthDate: new Date('2020-05-10'),
      bloodType: 'A+',
      loginHandle: 'omar2020',
      role: Role.CHILD,
      isActive: true,
    },
    create: {
      parentId: parentProfile.id,
      fullName: 'Omar Ahmad',
      fullNameArabic: 'عمر أحمد',
      gender: Gender.Male,
      birthDate: new Date('2020-05-10'),
      bloodType: 'A+',
      loginHandle: 'omar2020',
      role: Role.CHILD,
      isActive: true,
    },
  });

  const child2 = await prisma.child.upsert({
    where: {
      fullName_parentId: {
        fullName: 'Lina Ahmad',
        parentId: parentProfile.id,
      },
    },
    update: {
      fullNameArabic: 'لينا أحمد',
      gender: Gender.Female,
      birthDate: new Date('2018-11-15'),
      bloodType: 'B+',
      loginHandle: 'lina2018',
      role: Role.CHILD,
      isActive: true,
    },
    create: {
      parentId: parentProfile.id,
      fullName: 'Lina Ahmad',
      fullNameArabic: 'لينا أحمد',
      gender: Gender.Female,
      birthDate: new Date('2018-11-15'),
      bloodType: 'B+',
      loginHandle: 'lina2018',
      role: Role.CHILD,
      isActive: true,
    },
  });

  /**
   * 5) AVAILABILITY POLICY
   */
  const availabilityPolicy = await prisma.availabilityPolicy.upsert({
    where: { doctorId: doctorProfile.id },
    update: {
      weeklyOffDays: [WeekDay.FRIDAY],
      startWork: new Date('2026-01-01T09:00:00.000Z'),
      endWork: new Date('2026-01-01T13:00:00.000Z'),
      slot: 30,
      breakStart: new Date('2026-01-01T10:00:00.000Z'),
      breakEnd: new Date('2026-01-01T11:00:00.000Z'),
      sessionPrice: '25.00',
    },
    create: {
      doctorId: doctorProfile.id,
      weeklyOffDays: [WeekDay.FRIDAY],
      startWork: new Date('2026-01-01T09:00:00.000Z'),
      endWork: new Date('2026-01-01T17:00:00.000Z'),
      slot: 30,
      breakStart: new Date('2026-01-01T12:00:00.000Z'),
      breakEnd: new Date('2026-01-01T13:00:00.000Z'),
      sessionPrice: '25.00',
    },
  });

  /**
   * 6) EXCEPTIONS
   */
  const exception1 = await prisma.exception.create({
    data: {
      doctorId: doctorProfile.id,
      reason: 'Doctor attending conference',
      type: ExceptionType.DAY_OFF,
      startTime: new Date('2026-04-08T00:00:00.000Z'),
      endTime: new Date('2026-04-08T23:59:59.000Z'),
    },
  });

  const exception2 = await prisma.exception.create({
    data: {
      doctorId: doctorProfile.id,
      reason: 'Custom reduced hours',
      type: ExceptionType.CUSTOM_AVAILABLE_HOURS,
      startTime: new Date('2026-04-03T11:00:00.000Z'),
      endTime: new Date('2026-04-03T12:00:00.000Z'),
    },
  });

  /**
   * 7) APPOINTMENTS
   */
  const appointment1 = await prisma.appointment.create({
    data: {
      doctorId: doctorProfile.id,
      childId: child1.id,
      parentId: parentProfile.id,
      status: AppointmentStatus.CONFIRMED,
      date: new Date('2026-04-15T10:00:00.000Z'),
      reason: 'Routine child checkup',
      notes: {
        weightConcern: false,
        fever: false,
        comment: 'First visit',
      },
    },
  });

  const appointment2 = await prisma.appointment.create({
    data: {
      doctorId: doctorProfile.id,
      childId: child2.id,
      parentId: parentProfile.id,
      status: AppointmentStatus.PENDING,
      date: new Date('2026-04-16T11:00:00.000Z'),
      reason: 'Follow-up consultation',
      notes: {
        followUpFor: 'Nutrition',
      },
    },
  });

 


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
