import 'dotenv/config';
import crypto from 'crypto';
import prisma from '../src/libs/database.js';

const DEFAULT_ADMIN = {
  username: (process.env.SUPER_ADMIN_USERNAME || 'sosa_admin').trim(),
  password: process.env.SUPER_ADMIN_PASSWORD || 'sosaAdmin@2004',
  firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
  lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
};

async function ensureSuperAdmin() {
  const salt = process.env.ADMIN_PASSWORD_SALT || 'default-admin-salt';
  const passwordHash = crypto.scryptSync(DEFAULT_ADMIN.password, salt, 64).toString('hex');

  const existing = await prisma.admin.findUnique({ where: { username: DEFAULT_ADMIN.username } });
  if (existing) {
    await prisma.admin.update({
      where: { id: existing.id },
      data: {
        firstName: DEFAULT_ADMIN.firstName,
        lastName: DEFAULT_ADMIN.lastName,
        passwordHash,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        profileImageUrl: null,
      },
    });
    console.log(`✅ Updated existing admin -> SUPER_ADMIN: ${DEFAULT_ADMIN.username}`);
    return existing;
  }

  const created = await prisma.admin.create({
    data: {
      username: DEFAULT_ADMIN.username,
      passwordHash,
      firstName: DEFAULT_ADMIN.firstName,
      lastName: DEFAULT_ADMIN.lastName,
      profileImageUrl: null,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ Created SUPER_ADMIN user: ${DEFAULT_ADMIN.username}`);
  console.log(`   Use password: ${DEFAULT_ADMIN.password}`);
  return created;
}

async function createFinancialSeeds() {
  // Pick a small sample of worker profiles to seed financial data for
  const workers = await prisma.workerProfile.findMany({ take: 30 });
  if (!workers.length) {
    console.warn('⚠️  No worker profiles found. Run other seeds (users/governments/specializations) first.');
    return;
  }

  let balancesCreated = 0;
  let payoutMethodsCreated = 0;
  let withdrawsCreated = 0;

  for (const wp of workers) {
    // Ensure worker balance exists
    let balance = await prisma.workerBalance.findUnique({ where: { workerProfileId: wp.id } });
    if (!balance) {
      balance = await prisma.workerBalance.create({
        data: {
          workerProfileId: wp.id,
          totalEarned: BigInt(0),
          withdrawn: BigInt(0),
          pendingWithdraw: BigInt(0),
          onHoldForDispute: BigInt(0),
          deductedForDebts: BigInt(0),
        },
      });
      balancesCreated++;
    }

    // Possibly create a payout method (35% chance)
    const existingPayout = await prisma.payoutMethod.findFirst({ where: { workerProfileId: wp.id } });
    if (!existingPayout && Math.random() < 0.35) {
      const payout = await prisma.payoutMethod.create({
        data: {
          id: crypto.randomUUID(),
          workerProfileId: wp.id,
          methodType: 'BANK_ACCOUNT',
          accountName: `${wp.id.slice(0, 8)}-acct`,
          accountNumber: `ACCT-${crypto.createHash('sha1').update(wp.id).digest('hex').slice(0,12)}`,
          bankName: 'Local Bank',
          isDefault: false,
          isVerified: true,
        },
      });
      payoutMethodsCreated++;

      // Possibly create a seeded withdraw request (40% chance)
      if (Math.random() < 0.4) {
        const idemp = crypto.createHash('sha1').update(wp.id + '-seed-withdraw').digest('hex').slice(0,36);
        const existing = await prisma.withdrawRequest.findUnique({ where: { idempotencyKey: idemp } });
        if (!existing) {
          await prisma.withdrawRequest.create({
            data: {
              id: crypto.randomUUID(),
              workerProfileId: wp.id,
              workerBalanceId: balance.id,
              payoutMethodId: payout.id,
              amount: BigInt(Math.floor(Math.random() * 500000) + 10000), // cents
              status: 'PENDING',
              payoutMethodSnapshot: {},
              idempotencyKey: idemp,
              notes: 'Seeded withdraw request',
            },
          });
          withdrawsCreated++;
        }
      }
    }
  }

  console.log(`
✅ Financial seeds summary:`);
  console.log(`  Worker balances created: ${balancesCreated}`);
  console.log(`  Payout methods created: ${payoutMethodsCreated}`);
  console.log(`  Withdraw requests created: ${withdrawsCreated}`);
}

async function main() {
  console.log('🚀 Running admin + financial seeds...');
  await ensureSuperAdmin();
  await createFinancialSeeds();
  console.log('🎉 Seeds complete');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
