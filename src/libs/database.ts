import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import environment from '../configs/environment.js';

const connectionString = environment.database.url;

const adapter = new PrismaPg({
  connectionString: connectionString,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

export default prisma;
