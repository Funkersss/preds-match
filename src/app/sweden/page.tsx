import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HomeContent } from "@/components/home-content";
import {
  JsonLd,
  sportsEventSchema,
  breadcrumbSchema,
} from "@/components/json-ld";
import type { MatchData, PredictionData, UserData } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title:
    "Sweden at World Cup 2026 — Predict Every Match | MyTeamPredictions",
  description:
    "Sweden face Tunisia, Netherlands and Japan in the 2026 FIFA World Cup group stage. Predict every Swedish match and follow the squad all the way to the final.",
  alternates: {
    canonical: "https://myteampredictions.com/sweden",
    languages: {
      en: "https://myteampredictions.com/sweden",
      "x-default": "https://myteampredictions.com/sweden",
    },
  },
  openGraph: {
    type: "website",
    siteName: "MyTeamPredictions",
    title:
      "Sweden at World Cup 2026 — Predict Every Match | MyTeamPredictions",
    description:
      "Sweden face Tunisia, Netherlands and Japan in the 2026 FIFA World Cup group stage. Predict every Swedish match and follow the squad all the way to the final.",
    url: "https://myteampredictions.com/sweden",
    images: [
      {
        url: "https://myteampredictions.com/og-sweden.png",
        width: 1200,
        height: 630,
        alt: "Sweden at World Cup 2026 — Predict Every Match",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Sweden at World Cup 2026 — Predict Every Match | MyTeamPredictions",
    description:
      "Sweden face Tunisia, Netherlands and Japan in the 2026 FIFA World Cup group stage. Predict every Swedish match and follow the squad all the way to the final.",
    images: ["https://myteampredictions.com/og-sweden.png"],
  },
};

export default async function SwedenPage() {
  const user = await getCurrentUser();

  const matches = await prisma.match.findMany({
    where: { country: "SE" },
    orderBy: { matchDate: "asc" },
  });

  const predictions = user
    ? await prisma.prediction.findMany({
        where: { userId: user.id },
      })
    : [];

  const matchData: MatchData[] = matches.map((m) => ({
    id: m.id,
    team1: m.team1,
    team2: m.team2,
    team1Code: m.team1Code,
    team2Code: m.team2Code,
    matchDate: m.matchDate.toISOString(),
    venue: m.venue,
    status: m.status,
    result: m.result,
    team1Score: m.team1Score,
    team2Score: m.team2Score,
  }));

  const predData: PredictionData[] = predictions.map((p) => ({
    id: p.id,
    matchId: p.matchId,
    homeScore: p.homeScore,
    awayScore: p.awayScore,
    isCorrect: p.isCorrect,
  }));

  const userData: UserData | null = user
    ? { id: user.id, email: user.email, name: user.name }
    : null;

  return (
    <>
      {matchData.map((m) => (
        <JsonLd key={m.id} data={sportsEventSchema(m)} />
      ))}
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Sweden", path: "/sweden" },
        ])}
      />

      <HomeContent
        matches={matchData}
        predictions={predData}
        user={userData}
        country="SE"
        h1="Sweden at the FIFA World Cup 2026 — Predict the Matches"
        heroBannerSrc="/banners/banner-sweden-v1.webp"
        heroBannerAlt="Sweden — World Cup 2026 Predictions"
        sidebarBannerSrc="/banners/banner-sweden-v2.webp"
        timezone="Europe/Stockholm"
      />
    </>
  );
}
