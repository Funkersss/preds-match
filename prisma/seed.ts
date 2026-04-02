import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.promoCode.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();

  // Create matches for World Cup 2026 Group I — Norway
  const matches = await Promise.all([
    prisma.match.create({
      data: {
        team1: "TBD",
        team2: "Norway",
        team1Code: "TBD",
        team2Code: "NOR",
        matchDate: new Date("2026-06-17T02:00:00Z"),
        status: "PENDING",
      },
    }),
    prisma.match.create({
      data: {
        team1: "Norway",
        team2: "Senegal",
        team1Code: "NOR",
        team2Code: "SEN",
        matchDate: new Date("2026-06-23T04:00:00Z"),
        status: "PENDING",
      },
    }),
    prisma.match.create({
      data: {
        team1: "Norway",
        team2: "France",
        team1Code: "NOR",
        team2Code: "FRA",
        matchDate: new Date("2026-06-26T23:00:00Z"),
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
