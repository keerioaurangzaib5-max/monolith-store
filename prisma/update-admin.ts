import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

// Initialize SQLite adapter
const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ==========================================
  // CHANGE THESE VALUES TO YOUR DESIRED LOGIN:
  const NEW_EMAIL = "admin@monolith.com";
  const NEW_PASSWORD = "admin123";
  // ==========================================

  console.log(`🔒 Locating administrator account in dev.db...`);

  // Find the existing admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  });

  if (!admin) {
    console.log("❌ No administrator found in database. Please run seed script first: npx prisma db seed");
    return;
  }

  console.log(`⚙️ Hashing new password...`);
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

  console.log(`📝 Writing new credentials...`);
  await prisma.user.update({
    where: { id: admin.id },
    data: {
      email: NEW_EMAIL,
      password: hashedPassword
    }
  });

  console.log(`\n✅ Credentials updated successfully!`);
  console.log(`📧 Login Email: ${NEW_EMAIL}`);
  console.log(`🔑 Login Password: ${NEW_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Error updating credentials:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
