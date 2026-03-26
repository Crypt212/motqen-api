import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import environment from '../configs/environment.js';
const { Pool } = pg;

const connectionString = environment.database.url;
const pool = new Pool({
  connectionString: connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

export default prisma;
