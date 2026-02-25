import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for admin user
  const passwordHash = await bcrypt.hash('Admin@1234', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@qurandiscipline.academy' },
    update: {},
    create: {
      email: 'admin@qurandiscipline.academy',
      passwordHash,
      fullName: 'Super Admin',
      sex: 'male',
      role: 'admin',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('');
  console.log('✅ Seed complete — admin@qurandiscipline.academy / Admin@1234');
  console.log(`   Admin User ID: ${admin.id}`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
