import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Remove any stale Swedish matches from seed.ts (TBD ones)
  await prisma.match.deleteMany({
    where: { country: "SE" },
  });

  const matches = await Promise.all([
    prisma.match.create({
      data: {
        team1: "Sweden",
        team2: "Tunisia",
        team1Code: "SWE",
        team2Code: "TUN",
        matchDate: new Date("2026-06-15T02:00:00Z"),
        venue: "Estadio BBVA, Monterrey, Mexico",
        country: "SE",
        status: "PENDING",
      },
    }),
    prisma.match.create({
      data: {
        team1: "Netherlands",
        team2: "Sweden",
        team1Code: "NED",
        team2Code: "SWE",
        matchDate: new Date("2026-06-20T17:00:00Z"),
        venue: "NRG Stadium, Houston TX",
        country: "SE",
        status: "PENDING",
      },
    }),
    prisma.match.create({
      data: {
        team1: "Japan",
        team2: "Sweden",
        team1Code: "JPN",
        team2Code: "SWE",
        matchDate: new Date("2026-06-25T23:00:00Z"),
        venue: "AT&T Stadium, Arlington TX",
        country: "SE",
        status: "PENDING",
      },
    }),
  ]);

  console.log(`Inserted ${matches.length} Swedish matches:`);
  for (const m of matches) {
    console.log(`  ${m.team1} vs ${m.team2} — ${m.matchDate.toISOString()} (${m.venue})`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
