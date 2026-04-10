import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePromoCode } from "@/lib/promo";
import { sendPromoCodeEmail } from "@/lib/email";
import { determineOutcome } from "@/lib/football-api";

export async function POST(req: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, team1Score, team2Score } = body;

    if (!matchId || team1Score === undefined || team2Score === undefined) {
      return NextResponse.json(
        { error: "matchId, team1Score, and team2Score are required" },
        { status: 400 }
      );
    }

    const s1 = parseInt(team1Score);
    const s2 = parseInt(team2Score);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      return NextResponse.json(
        { error: "Scores must be non-negative integers" },
        { status: 400 }
      );
    }

    const outcome = determineOutcome(s1, s2);

    // Update match
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "FINISHED",
        result: outcome,
        team1Score: s1,
        team2Score: s2,
      },
    });

    // Score all predictions for this match
    const predictions = await prisma.prediction.findMany({
      where: { matchId },
      include: { user: true },
    });

    for (const pred of predictions) {
      let predicted: "TEAM1_WIN" | "DRAW" | "TEAM2_WIN";
      if (pred.homeScore > pred.awayScore) predicted = "TEAM1_WIN";
      else if (pred.homeScore < pred.awayScore) predicted = "TEAM2_WIN";
      else predicted = "DRAW";
      const isCorrect = predicted === outcome;

      await prisma.prediction.update({
        where: { id: pred.id },
        data: { isCorrect },
      });

      // Generate promo code for correct predictions
      if (isCorrect) {
        const existingPromo = await prisma.promoCode.findUnique({
          where: { userId_matchId: { userId: pred.userId, matchId } },
        });

        if (!existingPromo) {
          const code = generatePromoCode();
          const promo = await prisma.promoCode.create({
            data: {
              code,
              userId: pred.userId,
              matchId,
            },
          });

          // Send email notification
          const emailSent = await sendPromoCodeEmail(
            pred.user.email,
            pred.user.name,
            code,
            `${match.team1} ${s1} : ${s2} ${match.team2}`
          );

          if (emailSent) {
            await prisma.promoCode.update({
              where: { id: promo.id },
              data: { sentAt: new Date() },
            });
          }
        }
      }
    }

    return NextResponse.json({
      match,
      scoredPredictions: predictions.length,
      correctPredictions: predictions.filter((p) => {
        if (p.homeScore > p.awayScore) return outcome === "TEAM1_WIN";
        if (p.homeScore < p.awayScore) return outcome === "TEAM2_WIN";
        return outcome === "DRAW";
      }).length,
    });
  } catch (error) {
    console.error("Update result error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
