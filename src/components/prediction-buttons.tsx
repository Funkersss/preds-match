"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import type { Outcome } from "@/lib/types";
import { toast } from "sonner";

interface PredictionButtonsProps {
  matchId: string;
  team1: string;
  team2: string;
  existingPrediction: Outcome | null;
  isCorrect: boolean | null;
  matchFinished: boolean;
  locked: boolean;
  userId: string | null;
  onNeedAuth: () => void;
}

const OUTCOMES: { key: Outcome; label: (t1: string, t2: string) => string }[] =
  [
    { key: "TEAM1_WIN", label: (t1) => t1 },
    { key: "DRAW", label: () => "Draw" },
    { key: "TEAM2_WIN", label: (_, t2) => t2 },
  ];

export function PredictionButtons({
  matchId,
  team1,
  team2,
  existingPrediction,
  isCorrect,
  matchFinished,
  locked,
  userId,
  onNeedAuth,
}: PredictionButtonsProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState<Outcome | null>(null);
  const [optimistic, setOptimistic] = useState<Outcome | null>(null);

  const current = optimistic ?? existingPrediction;
  const isLocked = locked || !!current || matchFinished;

  async function handlePick(outcome: Outcome) {
    if (!userId) {
      onNeedAuth();
      return;
    }
    if (isLocked || submitting) return;

    setSubmitting(outcome);
    setOptimistic(outcome);

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, prediction: outcome }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit prediction");
        setOptimistic(null);
      } else {
        toast.success("Prediction locked in!");
        router.refresh();
      }
    } catch {
      toast.error("Network error. Try again.");
      setOptimistic(null);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="flex gap-2">
      {OUTCOMES.map(({ key, label }) => {
        const isSelected = current === key;
        const isFaded = current && !isSelected;
        const isSubmittingThis = submitting === key;
        const wasCorrect = matchFinished && isSelected && isCorrect === true;
        const wasWrong = matchFinished && isSelected && isCorrect === false;

        let btnClass = "pred-btn";
        if (wasCorrect) btnClass += " correct";
        else if (wasWrong) btnClass += " wrong";
        else if (isSelected) btnClass += " selected";
        if (isFaded) btnClass += " faded";

        return (
          <button
            key={key}
            className={btnClass}
            disabled={isLocked && !current}
            onClick={() => handlePick(key)}
            aria-label={`Predict ${label(team1, team2)}`}
            aria-busy={isSubmittingThis || undefined}
          >
            {locked && !current && (
              <Lock className="w-3.5 h-3.5 text-muted-foreground mb-1" aria-hidden="true" />
            )}
            <span className="text-[13px] leading-tight truncate max-w-full">
              {label(team1, team2)}
            </span>
            {isSubmittingThis && (
              <span className="absolute inset-0 flex items-center justify-center bg-secondary/80">
                <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
