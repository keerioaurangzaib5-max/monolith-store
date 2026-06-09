import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

let prisma: PrismaClient;

const url = process.env.DATABASE_URL || "file:./dev.db";

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaBetterSqlite3({ url });
  prisma = new PrismaClient({ adapter });
} else {
  // Prevent multiple instances of Prisma Client in development hot reloading
  if (!(global as any).prisma) {
    const adapter = new PrismaBetterSqlite3({ url });
    (global as any).prisma = new PrismaClient({ adapter });
  }
  prisma = (global as any).prisma;
}

export { prisma };
