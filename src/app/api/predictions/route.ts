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
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const body = await req.json();
    const { matchId, prediction } = body;

    if (!matchId || !prediction) {
      return NextResponse.json(
        { error: "matchId and prediction are required" },
        { status: 400 }
      );
    }

    if (!["TEAM1_WIN", "DRAW", "TEAM2_WIN"].includes(prediction)) {
      return NextResponse.json(
        { error: "Invalid prediction value" },
        { status: 400 }
      );
    }

    // Verify match exists and is accepting predictions
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check deadline: 1 hour before match
    const cutoff = new Date(match.matchDate.getTime() - 60 * 60 * 1000);
    if (new Date() >= cutoff) {
      return NextResponse.json(
        { error: "Predictions are closed for this match" },
        { status: 400 }
      );
    }

    if (match.status !== "PENDING") {
      return NextResponse.json(
        { error: "Match is no longer accepting predictions" },
        { status: 400 }
      );
    }

    // Check for duplicate
    const existing = await prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You already predicted this match" },
        { status: 409 }
      );
    }

    const created = await prisma.prediction.create({
      data: {
        userId,
        matchId,
        prediction,
      },
    });

    return NextResponse.json({ prediction: created }, { status: 201 });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
