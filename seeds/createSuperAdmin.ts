import 'dotenv/config';
import crypto from 'crypto';
import prisma from '../src/libs/database.js';

const username = (process.env.SUPER_ADMIN_USERNAME || 'sosa').trim();
const password = process.env.SUPER_ADMIN_PASSWORD || 'sosaAdmin@2004';
const firstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
const lastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';
const salt = process.env.ADMIN_PASSWORD_SALT || 'default-admin-salt';

async function main() {
  console.log('🚀 Seeding Super Admin...');

  const activeSuperAdmin = await prisma.admin.findFirst({
    where: { role: 'SUPER_ADMIN', status: 'ACTIVE' },
  });

  if (activeSuperAdmin) {
    console.log(`✅ Active SUPER_ADMIN already exists: ${activeSuperAdmin.username}`);
    return;
  }

  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');

  const existingAdmin = await prisma.admin.findUnique({ where: { username } });

  if (existingAdmin) {
    await prisma.admin.update({
      where: { id: existingAdmin.id },
      data: {
        firstName,
        lastName,
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        profileImageUrl: null,
      },
    });

    console.log(`✅ Updated existing admin user to SUPER_ADMIN: ${username}`);
    return;
  }

  await prisma.admin.create({
    data: {
      username,
      passwordHash,
      firstName,
      lastName,
      profileImageUrl: null,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created SUPER_ADMIN user: ${username}`);
  console.log(`   Use password: ${password}`);
}

main()
  .catch((error) => {
    console.error('Failed to seed SUPER_ADMIN:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
