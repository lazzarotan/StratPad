import { PrismaClient } from "../src/generated/prisma/index.js";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  const filePath = path.join(process.cwd(), "src/data/tags.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const tags = JSON.parse(raw);

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: {
        name: tag.name,
      },
    });
    console.log(`Seeded: ${tag.name}`);
  }

  console.log("Tags seeded successfully");
}

main()
  .catch((error) => {
    console.error("Error seeding tags:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });