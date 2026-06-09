import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { HomeContent } from "@/components/home-content";
import type { MatchData, PredictionData, UserData } from "@/lib/types";

export const dynamic = "force-dynamic";

// Title, description and Open Graph are inherited from the root layout, which
// holds the homepage values. Here we only pin the canonical URL.
export const metadata: Metadata = {
  alternates: { canonical: "https://myteampredictions.com/" },
};

export default async function Home() {
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
    <HomeContent
      matches={matchData}
      predictions={predData}
      user={userData}
      country="NO"
      h1="World Cup 2026 — Predict Every Match"
      heroBannerSrc="/banners/banner-sweden-horizontal.webp"
      heroBannerAlt="My Team Predictions — World Cup 2026"
      sidebarBannerSrc="/banners/banner-norway-vertical.png"
      timezone="Europe/Oslo"
    />
  );
}
