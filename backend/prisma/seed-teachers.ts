import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test teachers and schedules...');

  // Create test users and teachers
  const teacher1User = await prisma.user.upsert({
    where: { email: 'teacher1@qurandiscipline.academy' },
    update: {},
    create: {
      email: 'teacher1@qurandiscipline.academy',
      passwordHash: await bcrypt.hash('Teacher@1234', 12),
      fullName: 'Ahmed Ibrahim',
      sex: 'male',
      role: 'teacher',
      isActive: true,
      emailVerified: true,
    },
  });

  const teacher2User = await prisma.user.upsert({
    where: { email: 'teacher2@qurandiscipline.academy' },
    update: {},
    create: {
      email: 'teacher2@qurandiscipline.academy',
      passwordHash: await bcrypt.hash('Teacher@1234', 12),
      fullName: 'Fatima Al-Zahra',
      sex: 'female',
      role: 'teacher',
      isActive: true,
      emailVerified: true,
    },
  });

  // Create teacher profiles
  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacher1User.id },
    update: {},
    create: {
      userId: teacher1User.id,
      sex: 'male',
      bio: 'Al-Azhar graduate specializing in Tajweed and Quran memorization.',
      qualifications: ['Ijazah in Quran', 'Al-Azhar University Graduate'],
      specializations: ['Tajweed', 'Memorization', 'Islamic Studies'],
      rating: 4.8,
      totalStudents: 45,
      isAvailable: true,
    },
  });

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacher2User.id },
    update: {},
    create: {
      userId: teacher2User.id,
      sex: 'female',
      bio: 'Certified Quran teacher with 5+ years of experience teaching sisters.',
      qualifications: ['Quran Certification', 'Ijazah in Progress'],
      specializations: ['Tajweed', 'Quran Reading', 'Islamic Studies'],
      rating: 4.9,
      totalStudents: 62,
      isAvailable: true,
    },
  });

  // Create schedules for teacher 1 (male) - Mon-Fri, 10am-6pm
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;
  for (const day of days) {
    await prisma.teacherSchedule.upsert({
      where: { id: `${teacher1.id}-${day}-morning` },
      update: {},
      create: {
        id: `${teacher1.id}-${day}-morning`,
        teacherId: teacher1.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '14:00',
        isAvailable: true,
        maxStudents: 3,
      },
    });

    await prisma.teacherSchedule.upsert({
      where: { id: `${teacher1.id}-${day}-afternoon` },
      update: {},
      create: {
        id: `${teacher1.id}-${day}-afternoon`,
        teacherId: teacher1.id,
        dayOfWeek: day,
        startTime: '15:00',
        endTime: '19:00',
        isAvailable: true,
        maxStudents: 3,
      },
    });
  }

  // Create schedules for teacher 2 (female) - Mon-Fri, 9am-5pm
  for (const day of days) {
    await prisma.teacherSchedule.upsert({
      where: { id: `${teacher2.id}-${day}-morning` },
      update: {},
      create: {
        id: `${teacher2.id}-${day}-morning`,
        teacherId: teacher2.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '13:00',
        isAvailable: true,
        maxStudents: 3,
      },
    });

    await prisma.teacherSchedule.upsert({
      where: { id: `${teacher2.id}-${day}-afternoon` },
      update: {},
      create: {
        id: `${teacher2.id}-${day}-afternoon`,
        teacherId: teacher2.id,
        dayOfWeek: day,
        startTime: '14:00',
        endTime: '18:00',
        isAvailable: true,
        maxStudents: 3,
      },
    });
  }

  console.log('✅ Test data created successfully!');
  console.log('   - 2 teachers (1 male, 1 female)');
  console.log('   - Schedules for Mon-Fri');
  console.log('');
  console.log('   Teacher 1: teacher1@qurandiscipline.academy / Teacher@1234');
  console.log('   Teacher 2: teacher2@qurandiscipline.academy / Teacher@1234');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
