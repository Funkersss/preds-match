import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  await prisma.promoCode.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();

  const matches = await Promise.all([
    prisma.match.create({
      data: {
        team1: "Sweden",
        team2: "TBD",
        team1Code: "SWE",
        team2Code: "TBD",
        matchDate: new Date("2026-06-13T14:00:00Z"),
        status: "PENDING",
      },
    }),
    prisma.match.create({
      data: {
        team1: "TBD",
        team2: "Sweden",
        team1Code: "TBD",
        team2Code: "SWE",
        matchDate: new Date("2026-06-18T20:00:00Z"),
        status: "PENDING",
      },
    }),
    prisma.match.create({
      data: {
        team1: "Sweden",
        team2: "TBD",
        team1Code: "SWE",
        team2Code: "TBD",
        matchDate: new Date("2026-06-23T20:00:00Z"),
        status: "PENDING",
      },
    }),
  ]);

  console.log(`Created ${matches.length} matches:`);
  for (const m of matches) {
    console.log(`  ${m.team1} vs ${m.team2} — ${m.matchDate.toISOString()}`);
  }
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
