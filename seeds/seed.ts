import crypto from 'crypto';
import prisma from '../src/libs/database';

/* =========================
   UTILS
========================= */

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function jitterCoordinate(value: number, spread = 0.02) {
  return value + (Math.random() * 2 - 1) * spread;
}

function generateAddress(cityName: string) {
  const streets = [
    'شارع التحرير',
    'شارع الجمهورية',
    'شارع النيل',
    'شارع الهرم',
    'شارع السلام',
    'شارع الوحدة',
    'شارع النصر',
    'شارع الأمل',
  ];

  const buildingNums = ['١٢', '٤٥', '٧', '٢٣', '١٠٠', '٨', '٦٧', '٣'];

  return `${pick(buildingNums)} ${pick(streets)}، ${cityName}`;
}

/* =========================
   POOLS
========================= */

const CLIENT_MSGS_POOL = [
  'السلام عليكم، محتاج حد شاطر يشتغل عندي، إيه الأسعار عندك؟',
  'ممكن تيجي بكرة الصبح؟',
  'كام هتاخد على الشغلة دي تقريبًا؟',
  'أنا محتاج تيجي بأدواتك كاملة',
  'الشغل محتاج يخلص في نفس اليوم',
  'تقدر تبعتلي صورة من شغلك الأول؟',
  'هل بتضمن الشغل؟',
  'اتصل بيا عشان نتكلم في التفاصيل',
  'فين بالظبط بتشتغل؟ أنا في مدينة نصر',
  'ممكن تيجي تعمل معاينة الأول؟',
  'معايا عربية تقدر تيجي في أي وقت',
  'أنا في أجازة الأسبوع ده، هيكون وقتك أحسن عندك امتى؟',
  'لو الشغل أكتر هيبقى في خصم؟',
  'ممكن توريلي أعمال سابقة؟',
  'محتاج حاجة طارئة النهارده لو ممكن',
];

const WORKER_MSGS_POOL = [
  'وعليكم السلام، أيوه متاح. قولي التفاصيل',
  'أيوه بعدي، هييجي عليا خير إن شاء الله',
  'السعر بيتحدد بعد المعاينة، بس تقريبًا بين ٣٠٠ و ٥٠٠ جنيه',
  'معايا كل الأدوات اللي محتاجها',
  'إيه نوع المشكلة بالظبط؟',
  'تمام، ابعتلي عنوانك',
  'أنا بضمن شغلي، لو في أي حاجة برجع أصلحها بالمجان',
  'هبعتلك صور من شغل قبل كده',
  'قريب منك، هوصل في نص ساعة',
  'بكره الصبح ٩ يناسبك؟',
  'أيوه بشتغل في المنطقة دي كتير',
  'هييجي عليا خير، بس محتاج أعرف حجم الشغلة الأول',
  'السعر شامل الخامات',
  'معايا فريق لو الشغل كبير',
  'تمام، هكون عندك الساعة ١٠ الصبح',
];

const POSITIVE_COMMENTS = [
  'شغل ممتاز وفي وقته، هينصحلو لكل الناس',
  'محترف جداً، الشغل نظيف وأسعاره معقولة',
  'دقيق في المواعيد وشغله على مستوى عالي',
  'تجربة ممتازة، هتعامل معاه تاني بالتأكيد',
  'شغل ممتاز، شكراً جزيلاً',
];

const NEGATIVE_COMMENTS = [
  'تأخر كتير في الموعد',
  'الشغل كان مقبول بس مش على المستوى المتوقع',
  'السعر كان أغلى شوية من المتفق عليه',
];

/* =========================
   HELPERS
========================= */

async function runParallel<T>(items: T[], worker: (item: T) => Promise<void>) {
  await Promise.all(items.map(worker));
}

async function updateWorkerStats(workerProfileId: string) {
  const orders = await prisma.order.findMany({
    where: {
      workerProfileId,
      orderStatus: 'COMPLETED',
      rate: { not: -1 },
    },
    select: { rate: true },
  });

  if (orders.length === 0) return;

  const totalRating = orders.reduce((sum, o) => sum + (o.rate ?? 0), 0);
  const avgRate = totalRating / orders.length;

  await prisma.workerProfile.update({
    where: { id: workerProfileId },
    data: {
      rate: Math.round(avgRate * 10) / 10,
      completedJobsCount: orders.length,
    },
  });
}

function generateRating(): number {
  const r = Math.random();
  if (r < 0.05) return 1;
  if (r < 0.12) return 2;
  if (r < 0.25) return 3;
  if (r < 0.55) return 4;
  return 5;
}

/* =========================
   USERS + LOCATIONS
========================= */

const usedPhones = new Set<string>();

function generateUniquePhone(): string {
  let phone: string;
  let tries = 0;

  do {
    const prefixes = ['010', '011', '012', '015'];
    const prefix = pick(prefixes);
    const number = Math.floor(Math.random() * 1e8)
      .toString()
      .padStart(8, '0');

    phone = `${prefix}${number}`;
    tries++;

    if (tries > 100) throw new Error("Can't generate unique phone after 100 tries");
  } while (usedPhones.has(phone));

  usedPhones.add(phone);
  return phone;
}

async function createUserForCity(gov: any, city: any, isWorker: boolean) {
  const firstName = pick(['محمد', 'أحمد', 'علي', 'فاطمة', 'مريم']);
  const middleName = pick(['محمد', 'أحمد', 'علي', 'حسن']);
  const lastName = pick(['السيد', 'حسن', 'إبراهيم', 'النجار']);

  const createdUser = await prisma.user.create({
    data: {
      phoneNumber: generateUniquePhone(),
      firstName,
      middleName,
      lastName,
      ...(isWorker
        ? {
            workerProfile: {
              create: {
                experienceYears: randInt(1, 15),
                acceptsUrgentJobs: Math.random() > 0.4,
                bio: Math.random() > 0.3 ? 'خبرة في المجال' : null,
              },
            },
          }
        : {
            clientProfile: {
              create: {},
            },
          }),
    },
    include: {
      workerProfile: true,
      clientProfile: true,
    },
  });

  const locationsCount = isWorker ? randInt(1, 6) : randInt(1, 3);

  await Promise.all(
    Array.from({ length: locationsCount }, async (_, j) => {
      const lat = jitterCoordinate(city.lat);
      const lng = jitterCoordinate(city.long);
      const isMain = j === 0;

      await prisma.$executeRaw`
        INSERT INTO "locations" (
          "id",
          "userId",
          "governmentId",
          "cityId",
          "address",
          "addressNotes",
          "isMain",
          "pointGeography",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          ${crypto.randomUUID()},
          ${createdUser.id},
          ${gov.id},
          ${city.id},
          ${generateAddress(city.name)},
          ${null},
          ${isMain},
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `;
    })
  );

  return createdUser;
}

export async function createUsers(governments: any[]) {
  const users: any[] = [];
  const workers: any[] = [];

  await Promise.all(
    governments.flatMap((gov) =>
      gov.citys.map(async (city: any) => {
        const baseCount = ['Cairo', 'Giza', 'القاهرة', 'الجيزة'].includes(city.name)
          ? 10
          : ['Alexandria', 'الإسكندرية'].includes(city.name)
            ? 7
            : 4;

        await Promise.all(
          Array.from({ length: baseCount }, async () => {
            const isWorker = Math.random() < 0.6;
            const createdUser = await createUserForCity(gov, city, isWorker);

            users.push(createdUser);
            if (createdUser.workerProfile) workers.push(createdUser);
          })
        );
      })
    )
  );

  return { users, workers };
}

/* =========================
   SKILLS
========================= */

async function assignSkills(workers: any[]) {
  const allSpecializations = await prisma.specialization.findMany({
    include: { subSpecializations: true },
  });

  const validSpecializations = allSpecializations.filter((s) => s.subSpecializations.length > 0);

  if (validSpecializations.length === 0) {
    console.warn(
      '⚠️  No specializations with sub-specializations found, skipping skill assignment'
    );
    return;
  }

  await Promise.all(
    workers.map(async (w) => {
      const r = Math.random();
      const count = r < 0.1 ? 3 : r < 0.35 ? 2 : 1;

      const chosen = shuffle(validSpecializations).slice(
        0,
        Math.min(count, validSpecializations.length)
      );

      await Promise.all(
        chosen.map(async (spec) => {
          const sub = pick(spec.subSpecializations);

          await prisma.chosenSpecialization.upsert({
            where: {
              workerProfileId_subSpecializationId: {
                workerProfileId: w.workerProfile.id,
                subSpecializationId: sub.id,
              },
            },
            update: {},
            create: {
              workerProfileId: w.workerProfile.id,
              specializationId: spec.id,
              subSpecializationId: sub.id,
            },
          });
        })
      );
    })
  );
}

/* =========================
   GOVERNMENTS
========================= */

async function assignWorkGovernments(workers: any[], governments: any[]) {
  await Promise.all(
    workers.map(async (worker) => {
      const count = Math.random() < 0.5 ? 1 : Math.random() < 0.7 ? 2 : 3;
      const chosen = shuffle(governments).slice(0, count);

      await prisma.workerProfile.update({
        where: { id: worker.workerProfile.id },
        data: {
          workGovernments: {
            connect: chosen.map((g: any) => ({ id: g.id })),
          },
        },
      });
    })
  );
}

/* =========================
   FINANCIAL SEEDS
   Small, safe financial data so features depending on them work in dev
========================= */

async function createPayoutMethodsAndWithdraws(workerProfiles: any[]) {
  // Upsert/deduplicate behavior:
  // - Ensure a WorkerBalance exists for the worker
  // - Create a deterministic payout method per worker if none exists
  // - Create at most one seeded withdrawRequest per worker using a deterministic idempotency key
  await Promise.all(
    workerProfiles.map(async (wp) => {
      try {
        // Ensure a worker balance exists (create if missing)
        let balance = await prisma.workerBalance.findUnique({ where: { workerProfileId: wp.id } });
        if (!balance) {
          balance = await prisma.workerBalance.create({
            data: { workerProfileId: wp.id, totalEarned: BigInt(0), withdrawn: BigInt(0), pendingWithdraw: BigInt(0), onHoldForDispute: BigInt(0), deductedForDebts: BigInt(0) },
          });
        }

        // Create a deterministic account number so repeated seed runs don't create duplicates
        const acctHash = crypto.createHash('sha1').update(wp.id).digest('hex').slice(0, 12);
        const accountNumber = `ACCT-${acctHash}`;

        // Check if the worker already has any payout method — if so, skip creating another
        let payout = await prisma.payoutMethod.findFirst({ where: { workerProfileId: wp.id } });
        if (!payout && Math.random() < 0.35) {
          payout = await prisma.payoutMethod.create({
            data: {
              id: crypto.randomUUID(),
              workerProfileId: wp.id,
              methodType: 'BANK_ACCOUNT',
              accountName: `${wp.id.slice(0, 8)}-acct`,
              accountNumber,
              bankName: 'Local Bank',
              isDefault: false,
              isVerified: true,
            },
          });
        }

        // Deterministic idempotency key for a seeded withdraw (so re-running the seed won't duplicate)
        const withdrawIdemp = crypto.createHash('sha1').update(wp.id + '-seed-withdraw').digest('hex').slice(0, 36);
        const existingWithdraw = await prisma.withdrawRequest.findUnique({ where: { idempotencyKey: withdrawIdemp } });

        // Create a withdraw request only if we have a payout method and no existing seeded withdraw
        if (payout && !existingWithdraw && Math.random() < 0.45) {
          await prisma.withdrawRequest.create({
            data: {
              id: crypto.randomUUID(),
              workerProfileId: wp.id,
              workerBalanceId: balance.id,
              payoutMethodId: payout.id,
              amount: BigInt(randInt(10000, 500000)), // cents
              status: 'PENDING',
              payoutMethodSnapshot: {},
              idempotencyKey: withdrawIdemp,
              notes: 'Seeded withdraw request',
            },
          });
        }
      } catch (e) {
        // Non-fatal, continue
        console.error('Error creating payout/withdraw for worker', wp.id, e?.message ?? e);
      }
    })
  );
}

/* =========================
   CHATS + MESSAGES
========================= */

async function createConversation(clientId: string, workerId: string) {
  return prisma.conversation.create({
    data: {
      participants: {
        create: [
          { userId: clientId, role: 'CLIENT' },
          { userId: workerId, role: 'WORKER' },
        ],
      },
    },
  });
}

async function generateMessages(convId: string, clientId: string, workerId: string) {
  const count = Math.random() < 0.2 ? randInt(7, 12) : randInt(3, 6);

  const clientMsgs = shuffle(CLIENT_MSGS_POOL);
  const workerMsgs = shuffle(WORKER_MSGS_POOL);

  const messages = Array.from({ length: count }, (_, i) => {
    const isClient = i % 2 === 0;
    const msg = isClient ? clientMsgs[i % clientMsgs.length] : workerMsgs[i % workerMsgs.length];

    return {
      conversationId: convId,
      senderId: isClient ? clientId : workerId,
      messageNumber: i + 1,
      content: msg,
    };
  });

  await prisma.message.createMany({ data: messages });

  await prisma.conversation.update({
    where: { id: convId },
    data: { messageCounter: count },
  });
}

/* =========================
   ORDERS
========================= */

async function createOrder(clientId: string, workerId: string, priceOverride?: number) {
  const client = await prisma.clientProfile.findUnique({
    where: { userId: clientId },
  });

  const worker = await prisma.workerProfile.findUnique({
    where: { userId: workerId },
    include: { chosenSpecializations: true },
  });

  if (!client || !worker) return null;
  if (!worker.chosenSpecializations.length) return null;

  // Get client's main location
  const location = await prisma.location.findFirst({
    where: { userId: clientId, isMain: true },
  });
  if (!location) return null;

  const subSpecId = pick(worker.chosenSpecializations).subSpecializationId;

  const finalPrice =
    priceOverride ??
    pick([randInt(80, 200), randInt(200, 500), randInt(500, 1200), randInt(1200, 3000)]);

  const rating = generateRating();
  const comment =
    rating >= 4 ? pick(POSITIVE_COMMENTS) : rating <= 2 ? pick(NEGATIVE_COMMENTS) : null;

  const titles = ['إصلاح عام', 'صيانة منزلية', 'تركيب', 'صيانة', 'تشطيب'];

  const order = await prisma.order.create({
    data: {
      title: pick(titles),
      description: 'طلب خدمة',
      clientProfileId: client.id,
      workerProfileId: worker.id,
      locationId: location.id,
      subSpecializationId: subSpecId,
      finalPrice,
      orderStatus: 'COMPLETED',
      workStatus: 'DONE',
      rate: rating,
      comment,
      startDate: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000),
      workFinishedAt: new Date(),
    },
  });

  return order;
}

/* =========================
   CHAT + ORDER FLOW
========================= */

async function generateChats(users: any[], workers: any[]) {
  const clients = users.filter((u) => u.clientProfile);

  if (clients.length === 0) {
    console.warn('⚠️  No clients found, skipping chat generation');
    return;
  }

  const workersNeedingStats = new Set<string>();

  await Promise.all(
    workers.map(async (worker) => {
      const r = Math.random();
      const chatsCount = r < 0.15 ? 1 : r < 0.5 ? randInt(2, 3) : randInt(4, 7);

      const chosen = shuffle(clients).slice(0, Math.min(chatsCount, clients.length));

      await Promise.all(
        chosen.map(async (client) => {
          const conv = await createConversation(client.id, worker.id);
          await generateMessages(conv.id, client.id, worker.id);

          if (Math.random() < 0.45) {
            const order = await createOrder(client.id, worker.id);
            if (order) workersNeedingStats.add(worker.workerProfile.id);
          }
        })
      );
    })
  );

  await Promise.all(
    [...workersNeedingStats].map((workerProfileId) => updateWorkerStats(workerProfileId))
  );
}

/* =========================
   MAIN
========================= */

async function main() {
  console.log('🚀 Seeding started...');

  const governments = await prisma.government.findMany({
    include: { citys: true },
  });

  if (governments.length === 0) {
    throw new Error('No governments found — seed the governments/cities first');
  }

  const { users, workers } = await createUsers(governments);
  console.log(`✅ Users + Workers created (${users.length} total, ${workers.length} workers)`);

  await assignSkills(workers);
  console.log('✅ Skills assigned');

  await assignWorkGovernments(workers, governments);
  console.log('✅ Work governments assigned');

  await generateChats(users, workers);
  console.log('✅ Chats + Orders created');

  // Financial seeds: payout methods and withdraw requests for some workers
  console.log('🔁 Creating payout methods and withdraw requests for some workers...');
  await createPayoutMethodsAndWithdraws(workers.map((w) => w.workerProfile));
  console.log('✅ Financial seeds created');

  const workerCount = await prisma.workerProfile.count();
  const orderCount = await prisma.order.count();
  const convCount = await prisma.conversation.count();
  const msgCount = await prisma.message.count();

  console.log(`\n📊 Final stats:`);
  console.log(`   Workers: ${workerCount}`);
  console.log(`   Orders: ${orderCount}`);
  console.log(`   Conversations: ${convCount}`);
  console.log(`   Messages: ${msgCount}`);
  console.log('\n🎉 Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
