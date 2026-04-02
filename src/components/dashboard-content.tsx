"use client";

import Link from "next/link";
import { TeamFlag } from "./flags";
import type { MatchData, PredictionData, PromoCodeData } from "@/lib/types";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Radio,
  Copy,
  Gift,
  Target,
} from "lucide-react";
import { toast } from "sonner";

interface DashboardContentProps {
  userName: string;
  predictions: (PredictionData & { match: MatchData })[];
  promoCodes: PromoCodeData[];
}

function outcomeLabel(
  prediction: string,
  match: MatchData
): string {
  if (prediction === "TEAM1_WIN") return `${match.team1} Win`;
  if (prediction === "TEAM2_WIN") return `${match.team2} Win`;
  return "Draw";
}

function statusBadge(match: MatchData, isCorrect: boolean | null) {
  if (match.status === "LIVE") {
    return (
      <span className="badge-live inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold">
        <Radio className="w-3 h-3" />
        Live
      </span>
    );
  }
  if (match.status === "FINISHED") {
    if (isCorrect === true) {
      return (
        <span className="badge-correct inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold">
          <CheckCircle2 className="w-3 h-3" />
          Correct
        </span>
      );
    }
    if (isCorrect === false) {
      return (
        <span className="badge-wrong inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold">
          <XCircle className="w-3 h-3" />
          Wrong
        </span>
      );
    }
  }
  return (
    <span className="badge-pending inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

export function DashboardContent({
  userName,
  predictions,
  promoCodes,
}: DashboardContentProps) {
  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Copied to clipboard");
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Your Dashboard
          </h1>
          <p className="text-text-sub text-sm mt-1">
            Welcome back, {userName}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Predictions */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4">
            Your Predictions
          </h2>

          {predictions.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-10 text-center">
              <Target className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold mb-1">No predictions yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Head to the home page to make your first prediction.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                View matches
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.map((pred, i) => (
                <div
                  key={pred.id}
                  className="bg-card border border-border p-4 sm:p-5 flex items-center gap-4 animate-fade-slide-up"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Teams */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <TeamFlag
                      code={pred.match.team1Code}
                      className="w-8 h-6 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">
                        {pred.match.team1} vs {pred.match.team2}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pred.match.matchDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Prediction */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {outcomeLabel(pred.prediction, pred.match)}
                    </p>
                    <div className="mt-1">
                      {statusBadge(pred.match, pred.isCorrect)}
                    </div>
                  </div>

                  {/* Score if finished */}
                  {pred.match.status === "FINISHED" &&
                    pred.match.team1Score !== null && (
                      <div className="shrink-0 text-center px-3 border-l border-border">
                        <span className="text-lg font-extrabold tabular-nums">
                          {pred.match.team1Score}:{pred.match.team2Score}
                        </span>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Promo Codes */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-4 flex items-center gap-2">
            <Gift className="w-3.5 h-3.5 text-primary" />
            Promo Codes
          </h2>

          {promoCodes.length === 0 ? (
            <div className="bg-card border border-border p-8 text-center">
              <p className="text-muted-foreground text-sm">
                No promo codes yet. Predict correctly to earn one!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {promoCodes.map((pc) => (
                <div
                  key={pc.id}
                  className="bg-card border border-border p-5 flex items-center justify-between"
                >
                  <div>
                    <p className="font-mono text-lg font-bold text-primary tracking-wider">
                      {pc.code}
                    </p>
                    {pc.match && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {pc.match.team1} vs {pc.match.team2}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => copyCode(pc.code)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border hover:border-primary transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
