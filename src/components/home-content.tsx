"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "./navbar";
import { AuthModal } from "./auth-modal";
import { MatchCard } from "./match-card";
import type { MatchData, PredictionData, UserData } from "@/lib/types";
import { Target, CalendarX, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface HomeContentProps {
  matches: MatchData[];
  predictions: PredictionData[];
  user: UserData | null;
}

type ScoreMap = Record<string, { home: number; away: number }>;

export function HomeContent({ matches, predictions, user }: HomeContentProps) {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData | null>(user);

  const predMap = new Map(predictions.map((p) => [p.matchId, p]));

  // Initialize scores from existing predictions or default to 0:0
  const [scores, setScores] = useState<ScoreMap>(() => {
    const init: ScoreMap = {};
    for (const m of matches) {
      const pred = predMap.get(m.id);
      init[m.id] = pred
        ? { home: pred.homeScore, away: pred.awayScore }
        : { home: 0, away: 0 };
    }
    return init;
  });

  const allPredicted = matches.length > 0 && matches.every((m) => predMap.has(m.id));

  const handleHomeScore = useCallback((matchId: string, v: number) => {
    setScores((prev) => ({ ...prev, [matchId]: { ...prev[matchId], home: v } }));
  }, []);

  const handleAwayScore = useCallback((matchId: string, v: number) => {
    setScores((prev) => ({ ...prev, [matchId]: { ...prev[matchId], away: v } }));
  }, []);

  const openPredictionMatches = matches.filter((m) => {
    if (m.status !== "PENDING") return false;
    const cutoff = new Date(m.matchDate).getTime() - 60 * 60 * 1000;
    return Date.now() < cutoff;
  });

  const canSubmit = currentUser && openPredictionMatches.length > 0;

  async function handleSubmitAll() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    try {
      const results = await Promise.all(
        openPredictionMatches.map((match) => {
          const score = scores[match.id] ?? { home: 0, away: 0 };
          return fetch("/api/predictions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              matchId: match.id,
              homeScore: score.home,
              awayScore: score.away,
            }),
          });
        })
      );

      const allOk = results.every((r) => r.ok);
      if (allOk) {
        toast.success("Predictions saved!");
        setSubmitted(true);
        router.refresh();
      } else {
        const errors = await Promise.all(
          results.filter((r) => !r.ok).map((r) => r.json())
        );
        const msg = errors[0]?.error || "Failed to save some predictions";
        toast.error(msg);
      }
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const showThankYouBanner = allPredicted || submitted;
  const showMatchCards = !showThankYouBanner;

  return (
    <>
      <Navbar user={currentUser} onSignIn={() => setAuthOpen(true)} />

      {/* Hero — full-screen banner */}
      <section className="relative w-full">
        <Image
          src="/banners/banner-sweden-horizontal.webp"
          alt="World Cup 2026 — Sweden"
          width={1920}
          height={518}
          priority
          className="w-full h-auto"
          sizes="100vw"
        />
      </section>

      {/* Matches */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-20 relative z-10">

        {/* Thank you banner */}
        {showThankYouBanner && (
          <div className="mb-6 bg-card border border-accent-green/30 rounded-2xl p-6 flex items-start gap-4 animate-fade-slide-up shadow-sm">
            <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-accent-green" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg mb-1">Predictions received!</h2>
              <p className="text-sm text-muted-foreground mb-3">
                Your score predictions are saved. If you&apos;re right, you&apos;ll get a promo code via email.
              </p>
              <div className="flex flex-wrap gap-3">
                {predictions.map((pred) => {
                  const match = matches.find((m) => m.id === pred.matchId);
                  if (!match) return null;
                  return (
                    <div
                      key={pred.id}
                      className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="font-semibold text-muted-foreground">{match.team1}</span>
                      <span className="font-extrabold text-primary tabular-nums">
                        {pred.homeScore} : {pred.awayScore}
                      </span>
                      <span className="font-semibold text-muted-foreground">{match.team2}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {matches.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
            <CalendarX className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-1">No matches scheduled yet</p>
            <p className="text-sm text-muted-foreground">Check back soon for World Cup 2026 Group Stage fixtures.</p>
          </div>
        ) : (
          <>
            {/* Flex layout: matches grid + Norway sidebar */}
            <div className="flex gap-5 items-start">
              <div className="flex-1 min-w-0">
                {showMatchCards && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {matches.map((match, i) => (
                      <div key={match.id}>
                        <MatchCard
                          match={match}
                          prediction={predMap.get(match.id) ?? null}
                          userId={currentUser?.id ?? null}
                          index={i}
                          onNeedAuth={() => setAuthOpen(true)}
                          homeScore={scores[match.id]?.home ?? 0}
                          awayScore={scores[match.id]?.away ?? 0}
                          onHomeScore={(v) => handleHomeScore(match.id, v)}
                          onAwayScore={(v) => handleAwayScore(match.id, v)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vertical Norway Banner — sidebar on xl+ */}
              <div className="hidden xl:block w-[300px] shrink-0">
                <div className="sticky top-4 rounded-xl overflow-hidden border border-border/30 shadow-sm">
                  <Image
                    src="/banners/banner-norway-vertical.png"
                    alt="Norway — World Cup 2026"
                    width={1116}
                    height={1495}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Submit All button */}
            {canSubmit && !showThankYouBanner && (
              <div className="mt-8 flex justify-center animate-fade-in stagger-4">
                <button
                  onClick={handleSubmitAll}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all hover:translate-y-[-1px] hover:shadow-[0_6px_20px_rgba(43,90,170,0.2)]"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4" />
                      Submit Predictions
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CTA for non-authenticated users */}
            {!currentUser && (
              <div className="mt-10 text-center animate-fade-in stagger-4">
                <button
                  onClick={() => setAuthOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold text-sm rounded-xl transition-all hover:translate-y-[-1px] hover:shadow-[0_6px_20px_rgba(43,90,170,0.2)]"
                >
                  Sign in to make predictions
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Finnish Sniper Ad Banner — only for logged-in users */}
      {currentUser && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <div className="rounded-xl overflow-hidden border border-border/30 shadow-sm">
            <Image
              src="/banners/banner-finnish-sniper.webp"
              alt="Finnish Sniper — Play Now"
              width={1600}
              height={730}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Quiz Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <a
          href="/quiz"
          className="block rounded-xl overflow-hidden border border-border/30 shadow-sm hover:shadow-md transition-shadow"
        >
          <Image
            src="/banners/banner-quiz-norway.webp"
            alt="Find out which Norwegian FIFA star you are"
            width={1600}
            height={317}
            className="w-full h-auto"
          />
        </a>
      </div>

      {/* Haaland Quiz Banner */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <a
          href="/quiz"
          className="block rounded-xl overflow-hidden border border-border/30 shadow-sm hover:shadow-md transition-shadow"
        >
          <Image
            src="/banners/banner-haaland-quiz.webp"
            alt="Predict Haaland's World Cup — Play Now"
            width={1600}
            height={317}
            className="w-full h-auto"
          />
        </a>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/fifa-wc-2026.png" alt="" width={20} height={31} className="opacity-40" />
            <span className="text-xs text-muted-foreground">
              Predict the Match &mdash; World Cup 2026
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Not affiliated with FIFA</span>
        </div>
      </footer>

      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthSuccess={(userData) => setCurrentUser(userData)}
      />

    </>
  );
}
