import 'dotenv/config';
import pg from 'pg';
import { randomUUID } from 'crypto';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/* ===================== */
/* HELPERS              */
/* ===================== */

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function withTx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

/* ===================== */
/* SPECIALIZATIONS       */
/* ===================== */

async function ensureSpecs(client) {
  const res = await client.query(`
    SELECT s.id as "mainId", ss.id as "subId"
    FROM specializations s
    JOIN sub_specializations ss
    ON ss."mainSpecializationId" = s.id
  `);

  if (res.rows.length === 0) {
    throw new Error('No specializations found. Seed them first.');
  }

  return res.rows;
}

/* ===================== */
/* CREATE WORKER         */
/* ===================== */

async function createWorker(client, i) {
  const user = await client.query(`
    INSERT INTO users (id,"phoneNumber","firstName","middleName","lastName","updatedAt")
    VALUES ($1,$2,'Worker','Seed','${i}',NOW())
    RETURNING id
  `, [randomUUID(), `0155000${String(i).padStart(4,'0')}`]);

  const userId = user.rows[0].id;

  const worker = await client.query(`
    INSERT INTO worker_profiles (
      id,"userId","experienceYears","acceptsUrgentJobs","bio","updatedAt"
    )
    VALUES ($1,$2,$3,$4,$5,NOW())
    RETURNING id
  `, [
    randomUUID(),
    userId,
    randomInt(1,10),
    i % 2 === 0,
    'Seeded worker'
  ]);

  return worker.rows[0].id;
}

/* ===================== */
/* FULL SCENARIO         */
/* ===================== */

async function createScenario(client, specs) {
  /* USERS */

  const clientUser = await client.query(`
    INSERT INTO users (id,"phoneNumber","firstName","middleName","lastName","updatedAt")
    VALUES ($1,$2,'Client','Test','User',NOW())
    RETURNING id
  `, [randomUUID(), `010${Date.now().toString().slice(-8)}`]);

  const workerUser = await client.query(`
    INSERT INTO users (id,"phoneNumber","firstName","middleName","lastName","updatedAt")
    VALUES ($1,$2,'Worker','Pro','User',NOW())
    RETURNING id
  `, [randomUUID(), `011${Date.now().toString().slice(-8)}`]);

  const clientUserId = clientUser.rows[0].id;
  const workerUserId = workerUser.rows[0].id;

  /* PROFILES */

  const clientProfile = await client.query(`
    INSERT INTO client_profiles (id,"userId","updatedAt")
    VALUES ($1,$2,NOW())
    RETURNING id
  `, [randomUUID(), clientUserId]);

  const workerProfile = await client.query(`
    INSERT INTO worker_profiles (
      id,"userId","experienceYears","acceptsUrgentJobs","bio","updatedAt"
    )
    VALUES ($1,$2,5,true,'Scenario worker',NOW())
    RETURNING id
  `, [randomUUID(), workerUserId]);

  const clientProfileId = clientProfile.rows[0].id;
  const workerProfileId = workerProfile.rows[0].id;

  /* LOCATION */

  const gov = await client.query(`SELECT id FROM governments LIMIT 1`);
  const city = await client.query(`SELECT id FROM cities LIMIT 1`);

  const location = await client.query(`
    INSERT INTO locations (
      id,"userId","governmentId","cityId","address","isMain","pointGeography","updatedAt"
    )
    VALUES (
      $1,$2,$3,$4,'Cairo Test Address',true,
      ST_SetSRID(ST_MakePoint(31,30),4326),
      NOW()
    )
    RETURNING id
  `, [
    randomUUID(),
    clientUserId,
    gov.rows[0].id,
    city.rows[0].id
  ]);

  const locationId = location.rows[0].id;

  /* ORDER */

  const spec = specs[randomInt(0, specs.length - 1)];

  const order = await client.query(`
    INSERT INTO orders (
      id,"clientProfileId","workerProfileId","subSpecializationId","locationId",
      title,description,"date","orderStatus","workStatus","updatedAt"
    )
    VALUES (
      $1,$2,$3,$4,$5,
      'Fix issue','Something is broken',
      NOW(),'PENDING','PENDING',NOW()
    )
    RETURNING id
  `, [
    randomUUID(),
    clientProfileId,
    workerProfileId,
    spec.subId,
    locationId
  ]);

  const orderId = order.rows[0].id;

  /* TIMESLOT */

  await client.query(`
    INSERT INTO worker_occupied_timeslots (
      id,"workerProfileId","orderId","startDate","endDate"
    )
    VALUES ($1,$2,$3,NOW(),NOW() + interval '2 hours')
  `, [randomUUID(), workerProfileId, orderId]);

  /* CONVERSATION */

  const convo = await client.query(`
    INSERT INTO conversations (id,"updatedAt")
    VALUES ($1,NOW())
    RETURNING id
  `, [randomUUID()]);

  const convoId = convo.rows[0].id;

  await client.query(`
    INSERT INTO conversation_participants (
      id,"conversationId","userId","role","updatedAt"
    )
    VALUES
      ($1,$2,$3,'CLIENT',NOW()),
      ($4,$2,$5,'WORKER',NOW())
  `, [
    randomUUID(),
    convoId,
    clientUserId,
    randomUUID(),
    workerUserId
  ]);

  /* MESSAGES */

  const msgs = [
    ['Hello', clientUserId],
    ['Hi, how can I help?', workerUserId],
    ['I have an issue', clientUserId],
    ['On my way', workerUserId],
  ];

  let counter = 1;

  for (const [text, sender] of msgs) {
    await client.query(`
      INSERT INTO messages (
        id,"conversationId","senderId","messageNumber","content","updatedAt"
      )
      VALUES ($1,$2,$3,$4,$5,NOW())
    `, [
      randomUUID(),
      convoId,
      sender,
      counter++,
      text
    ]);
  }

  return { orderId, convoId };
}

/* ===================== */
/* MAIN                  */
/* ===================== */

async function main() {
  const workersCount = Number(process.argv[2]) || 10;

  await withTx(async (client) => {
    const specs = await ensureSpecs(client);

    for (let i = 1; i <= workersCount; i++) {
      await createWorker(client, i);
    }

    const scenario = await createScenario(client, specs);

    console.log('Done ✅');
    console.log(scenario);
  });
}

main()
  .catch(console.error)
  .finally(() => pool.end());