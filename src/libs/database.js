import { PrismaClient } from "./prisma/client/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import environment from "../configs/environment.js";
const { Pool } = pg;

const connectionString = environment.database.url.trim();

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
