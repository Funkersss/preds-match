import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMatchResult, determineOutcome } from "@/lib/football-api";
import { generatePromoCode } from "@/lib/promo";
import { sendPromoCodeEmail, sendAdminAlert } from "@/lib/email";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sends this header for cron jobs)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all matches that have started but don't have results yet
    const pendingMatches = await prisma.match.findMany({
      where: {
        status: { in: ["PENDING", "LIVE"] },
        matchDate: { lt: new Date() },
      },
    });

    if (pendingMatches.length === 0) {
      return NextResponse.json({ message: "No matches to check" });
    }

    const results: Record<string, string> = {};

    for (const match of pendingMatches) {
      const hoursElapsed =
        (Date.now() - match.matchDate.getTime()) / (1000 * 60 * 60);

      // If match has an API ID, try to fetch result
      if (match.apiMatchId) {
        const apiResult = await fetchMatchResult(match.apiMatchId);

        if (apiResult) {
          // Match is still in play — update status
          if (
            apiResult.status === "IN_PLAY" ||
            apiResult.status === "PAUSED"
          ) {
            if (match.status !== "LIVE") {
              await prisma.match.update({
                where: { id: match.id },
                data: { status: "LIVE" },
              });
            }
            results[match.id] = "live";
            continue;
          }

          // Match is finished — record result
          if (
            apiResult.status === "FINISHED" &&
            apiResult.homeScore !== null &&
            apiResult.awayScore !== null
          ) {
            const outcome = determineOutcome(
              apiResult.homeScore,
              apiResult.awayScore
            );

            await prisma.match.update({
              where: { id: match.id },
              data: {
                status: "FINISHED",
                result: outcome,
                team1Score: apiResult.homeScore,
                team2Score: apiResult.awayScore,
              },
            });

            // Score predictions
            await scorePredictions(match.id, outcome, match.team1, match.team2, apiResult.homeScore, apiResult.awayScore);
            results[match.id] = "finished";
            continue;
          }
        }
      }

      // Fallback: if >6 hours elapsed and no result, flag for manual review
      if (hoursElapsed > 6 && match.status !== "MANUAL_REVIEW") {
        await prisma.match.update({
          where: { id: match.id },
          data: { status: "MANUAL_REVIEW" },
        });

        await sendAdminAlert(
          `Match "${match.team1} vs ${match.team2}" has been running for ${Math.round(hoursElapsed)} hours without a result from the API. Manual review needed.`
        );

        results[match.id] = "needs_manual_review";
        continue;
      }

      results[match.id] = "waiting";
    }

    return NextResponse.json({
      checked: pendingMatches.length,
      results,
    });
  } catch (error) {
    console.error("Cron check-results error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function scorePredictions(
  matchId: string,
  outcome: "TEAM1_WIN" | "DRAW" | "TEAM2_WIN",
  team1: string,
  team2: string,
  team1Score: number,
  team2Score: number
) {
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

    if (isCorrect) {
      const existingPromo = await prisma.promoCode.findUnique({
        where: { userId_matchId: { userId: pred.userId, matchId } },
      });

      if (!existingPromo) {
        const code = generatePromoCode();
        const promo = await prisma.promoCode.create({
          data: { code, userId: pred.userId, matchId },
        });

        const emailSent = await sendPromoCodeEmail(
          pred.user.email,
          pred.user.name,
          code,
          `${team1} ${team1Score} : ${team2Score} ${team2}`
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
}
