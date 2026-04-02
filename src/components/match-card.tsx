"use client";

import { TeamFlag } from "./flags";
import { CountdownTimer } from "./countdown-timer";
import { PredictionButtons } from "./prediction-buttons";
import type { MatchData, PredictionData } from "@/lib/types";
import { Calendar } from "lucide-react";

interface MatchCardProps {
  match: MatchData;
  prediction: PredictionData | null;
  userId: string | null;
  index: number;
  onNeedAuth: () => void;
}

function formatMatchDate(date: string) {
  const d = new Date(date);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${days[d.getUTCDay()]}, ${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${h}:${m} UTC`;
}

function isLocked(matchDate: string): boolean {
  const cutoff = new Date(matchDate).getTime() - 60 * 60 * 1000;
  return Date.now() >= cutoff;
}

export function MatchCard({
  match,
  prediction,
  userId,
  index,
  onNeedAuth,
}: MatchCardProps) {
  const locked = isLocked(match.matchDate);
  const isLive = match.status === "LIVE";
  const isFinished = match.status === "FINISHED";
  const showScore = isFinished && match.team1Score !== null;

  return (
    <div
      className={`match-card animate-fade-slide-up ${isLive ? "is-live" : ""}`}
      style={{ animationDelay: `${index * 120}ms` }}
    >
      {/* Top gradient strip */}
      <div className="card-header" />

      <div className="p-5 sm:p-6">
        {/* Header: match info + date */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Match {index + 1}
            </span>
            {isLive && (
              <span className="live-badge">
                <span className="live-dot" />
                Live
              </span>
            )}
            {isFinished && (
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-green">
                Final
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span className="text-[11px]">{formatMatchDate(match.matchDate)}</span>
          </div>
        </div>

        {/* Teams — centered layout with circular flags */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-5">
          {/* Team 1 */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="flag-circle">
              <TeamFlag code={match.team1Code} />
            </div>
            <span className="font-bold text-sm text-center truncate w-full" title={match.team1}>
              {match.team1}
            </span>
          </div>

          {/* Score or VS */}
          <div className="shrink-0">
            {showScore ? (
              <div className="flex items-center gap-2 animate-score-reveal">
                <span className="text-3xl font-extrabold tabular-nums">
                  {match.team1Score}
                </span>
                <span className="text-muted-foreground text-lg font-light">:</span>
                <span className="text-3xl font-extrabold tabular-nums">
                  {match.team2Score}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xs font-bold">VS</span>
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="flag-circle">
              <TeamFlag code={match.team2Code} />
            </div>
            <span className="font-bold text-sm text-center truncate w-full" title={match.team2}>
              {match.team2}
            </span>
          </div>
        </div>

        {/* Countdown */}
        {!isFinished && (
          <div className="flex justify-center mb-5">
            <CountdownTimer targetDate={match.matchDate} />
          </div>
        )}

        {/* Prediction section */}
        <div>
          {!isFinished && !isLive && (
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-3 font-semibold text-center">
              {prediction
                ? "Your prediction"
                : locked
                  ? "Predictions closed — cutoff is 1h before kickoff"
                  : "Pick your prediction"}
            </p>
          )}
          {isFinished && prediction && (
            <p className="text-[11px] uppercase tracking-[0.1em] mb-3 font-semibold text-center">
              {prediction.isCorrect ? (
                <span className="text-accent-green">Correct prediction!</span>
              ) : (
                <span className="text-accent-red/70">Wrong prediction</span>
              )}
            </p>
          )}
          {isFinished && !prediction && (
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-3 font-semibold text-center">
              No prediction made
            </p>
          )}

          <PredictionButtons
            matchId={match.id}
            team1={match.team1}
            team2={match.team2}
            existingPrediction={prediction?.prediction ?? null}
            isCorrect={prediction?.isCorrect ?? null}
            matchFinished={isFinished || isLive}
            locked={locked}
            userId={userId}
            onNeedAuth={onNeedAuth}
          />
        </div>
      </div>
    </div>
  );
}
