import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Swap all 2-letter codes to 3-letter FIFA codes for Sweden matches
  // and correct venue for match 1
  const matches = await prisma.match.findMany({ where: { country: "SE" } });

  for (const m of matches) {
    const fix = (c: string) => {
      if (c === "SE") return "SWE";
      if (c === "TN") return "TUN";
      if (c === "NL") return "NED";
      if (c === "JP") return "JPN";
      return c;
    };
    const newTeam1Code = fix(m.team1Code);
    const newTeam2Code = fix(m.team2Code);
    const newVenue =
      m.team1 === "Sweden" && m.team2 === "Tunisia"
        ? "Estadio BBVA, Monterrey, Mexico"
        : m.venue;

    await prisma.match.update({
      where: { id: m.id },
      data: { team1Code: newTeam1Code, team2Code: newTeam2Code, venue: newVenue },
    });
    console.log(`Updated: ${m.team1} vs ${m.team2} — ${newTeam1Code}/${newTeam2Code} @ ${newVenue}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
