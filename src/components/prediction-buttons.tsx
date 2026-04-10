"use client";

import { Lock } from "lucide-react";
import type { PredictionData } from "@/lib/types";

interface ScorePredictionProps {
  matchId: string;
  team1: string;
  team2: string;
  prediction: PredictionData | null;
  locked: boolean;
  homeScore: number;
  awayScore: number;
  onHomeScore: (v: number) => void;
  onAwayScore: (v: number) => void;
}

export function PredictionButtons({
  team1,
  team2,
  prediction,
  locked,
  homeScore,
  awayScore,
  onHomeScore,
  onAwayScore,
}: ScorePredictionProps) {
  // If locked and has prediction — show the submitted score
  if (prediction) {
    const correctness =
      prediction.isCorrect === true
        ? "correct"
        : prediction.isCorrect === false
          ? "wrong"
          : null;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1 font-semibold truncate max-w-[72px]">
              {team1}
            </p>
            <div className="w-14 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-extrabold text-primary tabular-nums">
                {prediction.homeScore}
              </span>
            </div>
          </div>
          <span className="text-muted-foreground font-bold text-lg mt-5">:</span>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1 font-semibold truncate max-w-[72px]">
              {team2}
            </p>
            <div className="w-14 h-12 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-extrabold text-primary tabular-nums">
                {prediction.awayScore}
              </span>
            </div>
          </div>
        </div>
        {correctness && (
          <p
            className={`text-[11px] font-bold uppercase tracking-[0.1em] ${
              correctness === "correct" ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {correctness === "correct" ? "Correct!" : "Wrong"}
          </p>
        )}
      </div>
    );
  }

  // Locked but no prediction
  if (locked) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        <span className="text-xs font-semibold">Predictions closed</span>
      </div>
    );
  }

  // Editable score inputs
  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1 font-semibold truncate max-w-[72px]">
          {team1}
        </p>
        <input
          type="number"
          min={0}
          max={99}
          value={homeScore}
          onChange={(e) => onHomeScore(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
          className="w-14 h-12 text-center text-xl font-extrabold tabular-nums bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          aria-label={`${team1} score`}
        />
      </div>
      <span className="text-muted-foreground font-bold text-lg mt-5">:</span>
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1 font-semibold truncate max-w-[72px]">
          {team2}
        </p>
        <input
          type="number"
          min={0}
          max={99}
          value={awayScore}
          onChange={(e) => onAwayScore(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
          className="w-14 h-12 text-center text-xl font-extrabold tabular-nums bg-secondary border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          aria-label={`${team2} score`}
        />
      </div>
    </div>
  );
}
