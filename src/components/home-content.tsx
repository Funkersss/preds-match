"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar } from "./navbar";
import { AuthModal } from "./auth-modal";
import { MatchCard } from "./match-card";
import type { MatchData, PredictionData, UserData } from "@/lib/types";
import { Trophy, Target, Gift, CalendarX, CheckCircle2, ChevronDown } from "lucide-react";
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
  const [justSubmitted, setJustSubmitted] = useState(false);

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

  const canSubmit = user && openPredictionMatches.length > 0;

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
        setJustSubmitted(true);
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

  const showThankYouBanner = allPredicted || justSubmitted;
  // Show match cards when: banner is not shown, OR user clicked "Change predictions"
  const showMatchCards = !showThankYouBanner || justSubmitted;

  return (
    <>
      <Navbar user={user} onSignIn={() => setAuthOpen(true)} />

      {/* Hero */}
      <section className="hero-gradient text-white">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10 sm:pt-20 sm:pb-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-5 animate-fade-in">
                <div className="h-px w-8 bg-white/40" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  World Cup 2026 &middot; Group Stage
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[0.95] tracking-tight mb-4 animate-fade-slide-up">
                PREDICT
                <br />
                THE MATCH
              </h1>

              <p className="text-base sm:text-lg text-white/70 max-w-md leading-relaxed animate-fade-slide-up stagger-2 font-serif italic">
                Forecast Sweden&apos;s group stage results.
                <br />
                Get it right — earn rewards.
              </p>
            </div>

            <div className="hidden sm:block animate-fade-in stagger-2 shrink-0">
              <Image
                src="/fifa-wc-2026.png"
                alt="FIFA World Cup 2026"
                width={100}
                height={155}
                className="opacity-90 drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
                priority
              />
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4 animate-fade-slide-up stagger-3">
            {[
              { icon: Target, label: "Predict", desc: "Enter your score" },
              { icon: Trophy, label: "Watch", desc: "Follow the match" },
              { icon: Gift, label: "Win", desc: "Get a promo code" },
            ].map((step, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                  <step.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{step.label}</p>
                  <p className="text-xs text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banners + Matches */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 pb-20 relative z-10">
        {/* Horizontal Sweden Banner */}
        <div className="mb-5 rounded-xl overflow-hidden border border-border/30 shadow-sm">
          <Image
            src="/banners/banner-sweden-horizontal.png"
            alt="World Cup 2026 — Sweden"
            width={1920}
            height={518}
            className="w-full"
            priority
          />
        </div>

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
              {openPredictionMatches.length > 0 && (
                <button
                  onClick={() => setJustSubmitted(false)}
                  className="mt-3 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                >
                  <ChevronDown className="w-3 h-3" />
                  Change predictions
                </button>
              )}
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
                          userId={user?.id ?? null}
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
            {!user && (
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

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
