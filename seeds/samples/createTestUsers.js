import 'dotenv/config';
import { authService } from '../../src/state.js';
import {
  getExampleCityIds,
  getExampleGovernmentIds,
  getExampleSpecializationTree,
} from '../utils/exampleData.js';
import loadLocalImage from '../utils/imageLoader.js';
import prisma from '../../src/libs/database.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function seedAll() {
  try {
    console.log('Starting complete database seeding...');

    // Step 1: Seed Governments and Cities
    console.log('\n=== Step 1: Seeding Governments and Cities ===');
    await execAsync('node seeds/governments/createGovernments.js');

    // Step 2: Seed Specializations
    console.log('\n=== Step 2: Seeding Specializations ===');
    await execAsync('node seeds/specializations/createSpecializations.js');

    // Step 3: Seed Test Users
    console.log('\n=== Step 3: Seeding Test Users ===');
    await createUsers();

    // Step 4: Seed Conversations
    console.log('\n=== Step 4: Seeding Conversations ===');
    await execAsync('node seeds/samples/createConversations.js');

    console.log('\n--- Complete database seeding finished successfully! ---');
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  }
}

export async function createMains() {
  const exampleGovernmentIds = await getExampleGovernmentIds();
  const exampleGovernmentId = (await getExampleGovernmentIds(1))[0];
  const exampleCityId = (await getExampleCityIds(exampleGovernmentId, 1))[0];

  const exampleSpecializationTree = await getExampleSpecializationTree();

  const exampleImage = await loadLocalImage('./seeds/samples/', 'personal-profile.jpg');

  await authService.registerClient({
    userData: {
      phoneNumber: '01222222222',
      firstName: 'ahmed',
      middleName: 'saeed',
      lastName: 'farouk',
      role: 'USER',
      profileImageBuffer: exampleImage,
    },
    clientProfileData: {
      governmentId: exampleGovernmentId,
      cityId: exampleCityId,
      address: 'Cairo, Egypt',
      addressNotes: 'Near the government office',
    },
  });

  let x = await authService.registerWorker({
    userData: {
      phoneNumber: '01111111111',
      firstName: 'ahmed',
      middleName: 'mohamed',
      lastName: 'mohamed',
      role: 'USER',
      profileImageBuffer: exampleImage,
    },
    workerProfileData: {
      idImageBuffer: exampleImage,
      profileWithIdImageBuffer: exampleImage,
      experienceYears: 1,
      isInTeam: true,
      acceptsUrgentJobs: true,
      workGovernmentIds: exampleGovernmentIds,
      specializationsTree: exampleSpecializationTree,
    },
  });
  console.log(x);
}

export async function createUsers() {
  const exampleGovernmentIds = await getExampleGovernmentIds();
  const exampleGovernmentId = (await getExampleGovernmentIds(1))[0];
  const exampleCityId = (await getExampleCityIds(exampleGovernmentId, 1))[0];
  const exampleSpecializationTree = await getExampleSpecializationTree();

  const exampleImage = await loadLocalImage('./seeds/samples/', 'personal-profile.jpg');

  // 3. Seed Test User
  console.log('\n--- Seeding Test User ---');

  // Check if test user already exists
  const existingTestUser = await prisma.user.findFirst({
    where: { phoneNumber: '01001234567' },
  });

  if (!existingTestUser) {
    const testUser = await prisma.user.create({
      data: {
        phoneNumber: '01001234567',
        firstName: 'محمد',
        middleName: 'أحمد',
        lastName: 'علي',
        status: 'ACTIVE',
        role: 'USER',
      },
    });
    console.log(`Created test user: ${testUser.firstName} ${testUser.lastName}`);

    // Create client profile for test user
    const clientProfile = await prisma.clientProfile.create({
      data: {
        userId: testUser.id,
      },
    });

    // Create location for the client (since client needs at least one location)
    await prisma.location.create({
      data: {
        clientProfileId: clientProfile.id,
        governmentId: exampleGovernmentId,
        cityId: exampleCityId,
        address: 'القاهرة، شارع النيل',
        addressNotes: 'الشقة 5، العمارة 10',
        isMain: true,
      },
    });
    console.log(`Created client profile for test user`);
  } else {
    console.log('Test user already exists');
  }

  // 4. Seed Test Workers (Craftsmen)
  console.log('\n--- Seeding Test Workers ---');

  // Get some specializations and governments for workers
  const cairo = await prisma.government.findFirst({
    where: { name: 'Cairo' },
  });
  const giza = await prisma.government.findFirst({ where: { name: 'Giza' } });
  const carpentry = await prisma.specialization.findFirst({
    where: { name: 'Carpentry' },
  });
  const plumbing = await prisma.specialization.findFirst({
    where: { name: 'Plumbing' },
  });
  const electrical = await prisma.specialization.findFirst({
    where: { name: 'Electrical' },
  });

  const furnitureMaking = await prisma.subSpecialization.findFirst({
    where: { name: 'Furniture Making', mainSpecializationId: carpentry?.id },
  });
  const waterPiping = await prisma.subSpecialization.findFirst({
    where: { name: 'Water Piping', mainSpecializationId: plumbing?.id },
  });
  const wiring = await prisma.subSpecialization.findFirst({
    where: {
      name: 'Wiring & Rewiring',
      mainSpecializationId: electrical?.id,
    },
  });

  // Worker 1: Approved Carpenter
  const existingWorker1 = await prisma.user.findFirst({
    where: { phoneNumber: '01111111111' },
  });

  if (!existingWorker1 && cairo && carpentry && furnitureMaking) {
    const worker1 = await prisma.user.create({
      data: {
        phoneNumber: '01111111111',
        firstName: 'أحمد',
        middleName: 'محمود',
        lastName: 'حسن',
        status: 'ACTIVE',
        role: 'USER',
      },
    });

    const workerProfile1 = await prisma.workerProfile.create({
      data: {
        userId: worker1.id,
        experienceYears: 10,
        isInTeam: false,
        acceptsUrgentJobs: true,
        bio: 'نجار محترف متخصص في صناعة الأثاث المنزلي والمكتبي بخبرة 10 سنوات',
        workGovernments: {
          connect: {
            id: cairo.id,
          },
        },
        verification: {
          create: {
            status: 'APPROVED',
            idWithPersonalImageUrl: 'http://example.com/id1.jpg',
            idDocumentUrl: 'http://example.com/doc1.jpg',
            reason: 'Verified',
          },
        },
      },
    });

    await prisma.chosenSpecialization.create({
      data: {
        workerProfileId: workerProfile1.id,
        subSpecializationId: furnitureMaking.id,
        specializationId: carpentry.id,
      },
    });

    console.log(`Created approved worker: ${worker1.firstName} ${worker1.lastName} (Carpenter)`);
  }

  // Worker 2: Approved Plumber
  const existingWorker2 = await prisma.user.findFirst({
    where: { phoneNumber: '01222222222' },
  });

  if (!existingWorker2 && giza && plumbing && waterPiping) {
    const worker2 = await prisma.user.create({
      data: {
        phoneNumber: '01222222222',
        firstName: 'محمد',
        middleName: 'علي',
        lastName: 'عبدالله',
        status: 'ACTIVE',
        role: 'USER',
      },
    });

    const workerProfile2 = await prisma.workerProfile.create({
      data: {
        userId: worker2.id,
        experienceYears: 7,
        isInTeam: true,
        acceptsUrgentJobs: true,
        bio: 'سباك خبرة في تمديد المواسير وإصلاح التسريبات',
        verification: {
          create: {
            status: 'APPROVED',
            idWithPersonalImageUrl: 'http://example.com/id2.jpg',
            idDocumentUrl: 'http://example.com/doc2.jpg',
            reason: 'Verified',
          },
        },
        workGovernments: {
          connect: {
            id: giza.id,
          },
        },
      },
    });

    await prisma.chosenSpecialization.create({
      data: {
        workerProfileId: workerProfile2.id,
        subSpecializationId: waterPiping.id,
        specializationId: plumbing.id,
      },
    });

    console.log(`Created approved worker: ${worker2.firstName} ${worker2.lastName} (Plumber)`);
  }

  // Worker 3: Approved Electrician (accepts urgent jobs)
  const existingWorker3 = await prisma.user.findFirst({
    where: { phoneNumber: '01333333333' },
  });

  if (!existingWorker3 && cairo && electrical && wiring) {
    const worker3 = await prisma.user.create({
      data: {
        phoneNumber: '01333333333',
        firstName: 'خالد',
        middleName: 'حسين',
        lastName: 'إبراهيم',
        status: 'ACTIVE',
        role: 'USER',
      },
    });

    const workerProfile3 = await prisma.workerProfile.create({
      data: {
        userId: worker3.id,
        experienceYears: 12,
        isInTeam: false,
        acceptsUrgentJobs: true,
        bio: 'كهربائي محترف متخصص في الأعمال الكهربائية السكنية والتجارية',
        workGovernments: {
          connect: {
            id: cairo.id,
          },
        },
      },
    });

    await prisma.chosenSpecialization.create({
      data: {
        workerProfileId: workerProfile3.id,
        subSpecializationId: wiring.id,
        specializationId: electrical.id,
      },
    });

    console.log(`Created approved worker: ${worker3.firstName} ${worker3.lastName} (Electrician)`);
  }

  // Worker 4: Pending approval (for testing filters)
  const existingWorker4 = await prisma.user.findFirst({
    where: { phoneNumber: '01444444444' },
  });

  if (!existingWorker4 && cairo && carpentry && furnitureMaking) {
    const worker4 = await prisma.user.create({
      data: {
        phoneNumber: '01444444444',
        firstName: 'يوسف',
        middleName: 'سعيد',
        lastName: 'محمد',
        status: 'ACTIVE',
        role: 'USER',
      },
    });

    await prisma.workerProfile.create({
      data: {
        userId: worker4.id,
        experienceYears: 3,
        isInTeam: false,
        acceptsUrgentJobs: false,
        bio: 'نجار جديد يبحث عن فرص عمل',
        workGovernments: {
          connect: {
            id: cairo.id,
          },
        },
      },
    });

    console.log(`Created pending worker: ${worker4.firstName} ${worker4.lastName} (Not Approved)`);
  }
}

// Run the unified seeding function
seedAll();
