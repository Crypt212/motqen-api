import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import environment from "../config/environment.js";
const { Pool } = pg;

// Parse الـ URL بشكل صحيح
const connectionString = environment.database.url.trim(); // امسح أي مسافات

console.log("Database URL:", connectionString);
const pool = new Pool({
  connectionString: connectionString,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ["query", "error", "warn"],
});

export default prisma;
