# Monolith Deployment Guide

This document guides you through building, optimizing, and deploying the **Monolith** full-stack Next.js e-commerce platform for production.

---

## 1. Local Production Build
To test the production build locally:

1. Compile the Next.js bundle:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

---

## 2. Migrating from SQLite to PostgreSQL
While the project is configured with SQLite for zero-setup development, migrating to PostgreSQL for production is straightforward.

### Step 1: Install PostgreSQL Driver Adapter
Prisma 7 requires driver adapters for direct database connections. Install the PostgreSQL adapter and `pg` driver:
```bash
npm install @prisma/adapter-pg pg
npm install -D @types/pg
```

### Step 2: Update Schema Provider
Edit `prisma/schema.prisma` to change the datasource provider to `postgresql`:
```prisma
datasource db {
  provider = "postgresql"
}
```

### Step 3: Update Client Instantiation
Update `src/lib/prisma.ts` to swap the SQLite adapter for the PostgreSQL adapter:
```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!(global as any).prisma) {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    (global as any).prisma = new PrismaClient({ adapter });
  }
  prisma = (global as any).prisma;
}

export { prisma };
```

### Step 4: Run Migrations
Update `DATABASE_URL` in `.env` to point to your PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/monolith"
```
Then, generate the tables:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 3. Deploying to Vercel
Vercel is the recommended hosting platform for Next.js.

1. Push your repository to GitHub / GitLab / Bitbucket.
2. Link your project on the Vercel Dashboard.
3. Configure the following **Environment Variables** in Vercel settings:
   - `DATABASE_URL`: Your production PostgreSQL connection string.
   - `JWT_SECRET`: A secure random secret string.
   - `GST_RATE`: `18`
   - `PAYMENT_SANDBOX`: `false` (in production)
4. Deploy. Vercel automatically detects Next.js App Router and optimizes page speeds and static caching.
