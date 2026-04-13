import 'dotenv/config';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

const FIRST_NAMES = [
  'Ahmed',
  'Mohamed',
  'Omar',
  'Youssef',
  'Khaled',
  'Mostafa',
  'Hassan',
  'Mahmoud',
  'Tarek',
  'Karim',
];

const MIDDLE_NAMES = ['Ali', 'Saeed', 'Fathy', 'Nabil', 'Samir', 'Ibrahim'];
const LAST_NAMES = ['Hassan', 'Maher', 'Fawzy', 'Anwar', 'Nader', 'Ragab'];
const BIO_LINES = [
  'Experienced technician focused on quality and punctuality.',
  'Fast response and clean work with warranty for service.',
  'Specialized in home maintenance and urgent repairs.',
  'Professional craftsman with customer-first attitude.',
];

const SPECIALIZATION_TREE_SEED = [
  { main: 'Plumbing', subs: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning'] },
  { main: 'Electrical', subs: ['Wiring', 'Lighting Setup', 'Circuit Breaker Fix'] },
  { main: 'Carpentry', subs: ['Furniture Assembly', 'Wood Repair', 'Door Installation'] },
  { main: 'AC', subs: ['AC Installation', 'AC Maintenance', 'Gas Refill'] },
  { main: 'Painting', subs: ['Wall Painting', 'Wood Coating', 'Decorative Finish'] },
  { main: 'Cleaning', subs: ['Deep Cleaning', 'Post-Renovation Cleaning', 'Sofa Cleaning'] },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildPhone(index) {
  return `0155000${String(index).padStart(4, '0')}`;
}

function buildWorkerName(index) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const middleName = MIDDLE_NAMES[index % MIDDLE_NAMES.length];
  const lastName = LAST_NAMES[index % LAST_NAMES.length];
  return { firstName, middleName, lastName };
}

async function getWorkerProfileCapabilities() {
  const sql =
    "select column_name from information_schema.columns where table_schema='public' and table_name='worker_profiles'";
  const result = await pool.query(sql);
  const columns = new Set(result.rows.map((row) => String(row.column_name)));

  return {
    hasBio: columns.has('bio'),
    hasPortfolioId: columns.has('portfolioId'),
  };
}

async function ensureSpecializationTree() {
  const countResult = await pool.query(
    'select count(*)::int as c from sub_specializations where "mainSpecializationId" is not null'
  );

  if (countResult.rows[0].c === 0) {
    for (const treeNode of SPECIALIZATION_TREE_SEED) {
      const existingMain = await pool.query(
        'select id from specializations where name = $1 limit 1',
        [treeNode.main]
      );

      let mainId;
      if (existingMain.rows.length > 0) {
        mainId = existingMain.rows[0].id;
      } else {
        const insertedMain = await pool.query(
          'insert into specializations (id, name, "updatedAt") values ($1, $2, NOW()) returning id',
          [randomUUID(), treeNode.main]
        );
        mainId = insertedMain.rows[0].id;
      }

      for (const subName of treeNode.subs) {
        const existingSub = await pool.query(
          'select id from sub_specializations where name = $1 and "mainSpecializationId" = $2 limit 1',
          [subName, mainId]
        );

        if (existingSub.rows.length === 0) {
          await pool.query(
            'insert into sub_specializations (id, name, "mainSpecializationId", "updatedAt") values ($1, $2, $3, NOW())',
            [randomUUID(), subName, mainId]
          );
        }
      }
    }
  }

  const treeRows = await pool.query(
    `
      select
        s.id as "mainId",
        s.name as "mainName",
        ss.id as "subId",
        ss.name as "subName"
      from specializations s
      inner join sub_specializations ss on ss."mainSpecializationId" = s.id
      order by s.name, ss.name
    `
  );

  const treeMap = new Map();
  for (const row of treeRows.rows) {
    if (!treeMap.has(row.mainId)) {
      treeMap.set(row.mainId, {
        mainId: row.mainId,
        mainName: row.mainName,
        subSpecializations: [],
      });
    }

    treeMap.get(row.mainId).subSpecializations.push({
      id: row.subId,
      name: row.subName,
    });
  }

  return [...treeMap.values()];
}

async function createOrUpdateFakeWorker(index, capabilities, specializationTree) {
  const phoneNumber = buildPhone(index);
  const { firstName, middleName, lastName } = buildWorkerName(index);

  const userResult = await pool.query(
    `
      INSERT INTO "users" (
        "id",
        "phoneNumber",
        "firstName",
        "middleName",
        "lastName",
        "status",
        "role",
        "profileImageUrl",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'USER', $6, NOW())
      ON CONFLICT ("phoneNumber")
      DO UPDATE
      SET
        "firstName" = EXCLUDED."firstName",
        "middleName" = EXCLUDED."middleName",
        "lastName" = EXCLUDED."lastName",
        "status" = EXCLUDED."status",
        "role" = EXCLUDED."role",
        "profileImageUrl" = EXCLUDED."profileImageUrl",
        "updatedAt" = NOW()
      RETURNING "id"
    `,
    [
      randomUUID(),
      phoneNumber,
      firstName,
      middleName,
      lastName,
      `https://picsum.photos/seed/worker-${index}/400/400`,
    ]
  );

  const userId = userResult.rows[0].id;

  const workerColumns = [
    '"id"',
    '"userId"',
    '"experienceYears"',
    '"isInTeam"',
    '"acceptsUrgentJobs"',
  ];
  const workerValues = [randomUUID(), userId, randomInt(1, 15), index % 3 === 0, index % 2 === 0];

  if (capabilities.hasBio) {
    workerColumns.push('"bio"');
    workerValues.push(BIO_LINES[index % BIO_LINES.length]);
  }

  if (capabilities.hasPortfolioId) {
    workerColumns.push('"portfolioId"');
    workerValues.push(null);
  }

  workerColumns.push('"updatedAt"');

  const placeholders = workerValues.map((_, idx) => `$${idx + 1}`).join(', ');
  const updatedAtPlaceholder = `NOW()`;

  const updateSet = [
    '"experienceYears" = EXCLUDED."experienceYears"',
    '"isInTeam" = EXCLUDED."isInTeam"',
    '"acceptsUrgentJobs" = EXCLUDED."acceptsUrgentJobs"',
    '"updatedAt" = NOW()',
  ];

  if (capabilities.hasBio) {
    updateSet.splice(3, 0, '"bio" = EXCLUDED."bio"');
  }

  if (capabilities.hasPortfolioId) {
    updateSet.splice(capabilities.hasBio ? 4 : 3, 0, '"portfolioId" = EXCLUDED."portfolioId"');
  }

  const workerResult = await pool.query(
    `
      INSERT INTO "worker_profiles" (${workerColumns.join(', ')})
      VALUES (${placeholders}, ${updatedAtPlaceholder})
      ON CONFLICT ("userId")
      DO UPDATE
      SET
        ${updateSet.join(',\n        ')}
      RETURNING "id"
    `,
    workerValues
  );

  const workerProfileId = workerResult.rows[0].id;

  await pool.query(
    `
      INSERT INTO "verifications" (
        "id",
        "workerProfileId",
        "idWithPersonalImageUrl",
        "idDocumentUrl",
        "reason",
        "status",
        "updatedAt"
      )
      VALUES ($1, $2, $3, $4, $5, 'APPROVED', NOW())
      ON CONFLICT ("workerProfileId")
      DO UPDATE
      SET
        "idWithPersonalImageUrl" = EXCLUDED."idWithPersonalImageUrl",
        "idDocumentUrl" = EXCLUDED."idDocumentUrl",
        "reason" = EXCLUDED."reason",
        "status" = EXCLUDED."status",
        "updatedAt" = NOW()
    `,
    [
      randomUUID(),
      workerProfileId,
      `https://picsum.photos/seed/id-${index}/600/400`,
      `https://picsum.photos/seed/doc-${index}/600/400`,
      'Seeded test worker',
    ]
  );

  await pool.query('delete from chosen_specializations where "workerProfileId" = $1', [
    workerProfileId,
  ]);

  const selectedMainCount = Math.min(randomInt(1, 2), specializationTree.length);
  const shuffledMainNodes = [...specializationTree].sort(() => Math.random() - 0.5);
  const selectedMainNodes = shuffledMainNodes.slice(0, selectedMainCount);

  for (const mainNode of selectedMainNodes) {
    const subCount = Math.min(randomInt(1, 2), mainNode.subSpecializations.length);
    const selectedSubs = [...mainNode.subSpecializations]
      .sort(() => Math.random() - 0.5)
      .slice(0, subCount);

    for (const sub of selectedSubs) {
      await pool.query(
        `
          insert into chosen_specializations (
            "workerProfileId",
            "specializationId",
            "subSpecializationId",
            "updatedAt"
          )
          values ($1, $2, $3, NOW())
          on conflict do nothing
        `,
        [workerProfileId, mainNode.mainId, sub.id]
      );
    }
  }

  return {
    id: workerProfileId,
    userId,
    experienceYears: workerValues[2],
    isInTeam: workerValues[3],
    acceptsUrgentJobs: workerValues[4],
    bio: capabilities.hasBio ? workerValues[5] : null,
    phoneNumber,
  };
}

async function main() {
  try {
    const countArg = Number.parseInt(process.argv[2] ?? '', 10);
    const workersCount = Number.isNaN(countArg) ? 20 : Math.max(1, countArg);
    const capabilities = await getWorkerProfileCapabilities();
    const specializationTree = await ensureSpecializationTree();

    console.log(`Seeding ${workersCount} fake workers...`);

    const created = [];
    for (let i = 1; i <= workersCount; i += 1) {
      const worker = await createOrUpdateFakeWorker(i, capabilities, specializationTree);
      created.push(worker);
    }

    console.log(`Done. Upserted ${created.length} fake workers.`);
    console.log(
      'Sample worker_profiles:',
      created.slice(0, 3).map((w) => ({
        id: w.id,
        userId: w.userId,
        experienceYears: w.experienceYears,
        isInTeam: w.isInTeam,
        acceptsUrgentJobs: w.acceptsUrgentJobs,
        bio: w.bio,
      }))
    );
  } catch (error) {
    console.error('Failed to seed fake workers:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
