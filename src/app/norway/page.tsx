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
    "Norway at World Cup 2026 — Predict Every Match | MyTeamPredictions",
  description:
    "Norway return to the FIFA World Cup for the first time since 1998. Predict every Norwegian group stage match — Haaland, Ødegaard and the full squad face Iraq, Senegal and France.",
  alternates: { canonical: "https://myteampredictions.com/norway" },
  openGraph: {
    type: "website",
    siteName: "MyTeamPredictions",
    title:
      "Norway at World Cup 2026 — Predict Every Match | MyTeamPredictions",
    description:
      "Norway return to the FIFA World Cup for the first time since 1998. Predict every Norwegian group stage match — Haaland, Ødegaard and the full squad face Iraq, Senegal and France.",
    url: "https://myteampredictions.com/norway",
  },
};

export default async function NorwayPage() {
  const user = await getCurrentUser();

  const matches = await prisma.match.findMany({
    where: { country: "NO" },
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
          { name: "Norway", path: "/norway" },
        ])}
      />

      <HomeContent
        matches={matchData}
        predictions={predData}
        user={userData}
        country="NO"
        h1="Norway at the FIFA World Cup 2026 — Predict the Matches"
        heroBannerSrc="/banners/banner-sweden-horizontal.webp"
        heroBannerAlt="Norway — World Cup 2026 Predictions"
        sidebarBannerSrc="/banners/banner-norway-vertical.png"
        timezone="Europe/Oslo"
      />
    </>
  );
}
