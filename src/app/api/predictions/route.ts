import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { match: true },
    orderBy: { match: { matchDate: "asc" } },
  });

  return NextResponse.json({ predictions });
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await req.json();
    const { matchId, homeScore, awayScore } = body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return NextResponse.json(
        { error: "matchId, homeScore and awayScore are required" },
        { status: 400 }
      );
    }

    const home = parseInt(String(homeScore), 10);
    const away = parseInt(String(awayScore), 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0 || home > 99 || away > 99) {
      return NextResponse.json({ error: "Scores must be integers between 0 and 99" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const cutoff = new Date(match.matchDate.getTime() - 60 * 60 * 1000);
    if (new Date() >= cutoff) {
      return NextResponse.json({ error: "Predictions are closed for this match" }, { status: 400 });
    }

    if (match.status !== "PENDING") {
      return NextResponse.json({ error: "Match is no longer accepting predictions" }, { status: 400 });
    }

    const prediction = await prisma.prediction.upsert({
      where: { userId_matchId: { userId, matchId } },
      create: { userId, matchId, homeScore: home, awayScore: away },
      update: { homeScore: home, awayScore: away },
    });

    return NextResponse.json({ prediction }, { status: 200 });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
