import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DashboardContent } from "@/components/dashboard-content";
import type { MatchData, PredictionData, PromoCodeData } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id },
    include: { match: true },
    orderBy: { match: { matchDate: "asc" } },
  });

  const promoCodes = await prisma.promoCode.findMany({
    where: { userId: user.id },
    include: { match: true },
  });

  const predData: (PredictionData & { match: MatchData })[] = predictions.map(
    (p) => ({
      id: p.id,
      matchId: p.matchId,
      prediction: p.prediction,
      isCorrect: p.isCorrect,
      match: {
        id: p.match.id,
        team1: p.match.team1,
        team2: p.match.team2,
        team1Code: p.match.team1Code,
        team2Code: p.match.team2Code,
        matchDate: p.match.matchDate.toISOString(),
        status: p.match.status,
        result: p.match.result,
        team1Score: p.match.team1Score,
        team2Score: p.match.team2Score,
      },
    })
  );

  const promoData: PromoCodeData[] = promoCodes.map((pc) => ({
    id: pc.id,
    code: pc.code,
    matchId: pc.matchId,
    sentAt: pc.sentAt?.toISOString() ?? null,
    match: {
      id: pc.match.id,
      team1: pc.match.team1,
      team2: pc.match.team2,
      team1Code: pc.match.team1Code,
      team2Code: pc.match.team2Code,
      matchDate: pc.match.matchDate.toISOString(),
      status: pc.match.status,
      result: pc.match.result,
      team1Score: pc.match.team1Score,
      team2Score: pc.match.team2Score,
    },
  }));

  return (
    <DashboardContent
      userName={user.name}
      predictions={predData}
      promoCodes={promoData}
    />
  );
}
