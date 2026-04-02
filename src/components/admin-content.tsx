"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  RefreshCw,
  Users,
  Trophy,
  Ticket,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import type { Outcome, MatchStatus } from "@/lib/types";

interface AdminMatch {
  id: string;
  team1: string;
  team2: string;
  team1Code: string;
  team2Code: string;
  matchDate: string;
  apiMatchId: number | null;
  status: MatchStatus;
  result: Outcome | null;
  team1Score: number | null;
  team2Score: number | null;
  updatedAt: string;
  predictionCount: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  predictionCount: number;
}

interface AdminPrediction {
  id: string;
  userName: string;
  userEmail: string;
  matchLabel: string;
  prediction: Outcome;
  isCorrect: boolean | null;
  createdAt: string;
}

interface AdminPromo {
  id: string;
  code: string;
  userName: string;
  matchLabel: string;
  sentAt: string | null;
}

interface AdminContentProps {
  matches: AdminMatch[];
  users: AdminUser[];
  predictions: AdminPrediction[];
  promoCodes: AdminPromo[];
}

type Tab = "matches" | "users" | "predictions" | "promos";

export function AdminContent({
  matches,
  users,
  predictions,
  promoCodes,
}: AdminContentProps) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("matches");
  const [updatingMatch, setUpdatingMatch] = useState<string | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: "matches", label: "Matches", icon: <Trophy className="w-3.5 h-3.5" />, count: matches.length },
    { key: "users", label: "Users", icon: <Users className="w-3.5 h-3.5" />, count: users.length },
    { key: "predictions", label: "Predictions", icon: <Send className="w-3.5 h-3.5" />, count: predictions.length },
    { key: "promos", label: "Promo Codes", icon: <Ticket className="w-3.5 h-3.5" />, count: promoCodes.length },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to site
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Admin Panel
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.refresh()}
              className="text-xs border-border"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-0" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
              <span className="text-[10px] bg-secondary px-1.5 py-0.5 font-bold">
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6" role="tabpanel">
        {tab === "matches" && (
          <MatchesTab
            matches={matches}
            updatingMatch={updatingMatch}
            setUpdatingMatch={setUpdatingMatch}
            onRefresh={() => router.refresh()}
          />
        )}
        {tab === "users" && <UsersTab users={users} />}
        {tab === "predictions" && <PredictionsTab predictions={predictions} />}
        {tab === "promos" && <PromosTab promoCodes={promoCodes} />}
      </div>
    </div>
  );
}

function MatchesTab({
  matches,
  updatingMatch,
  setUpdatingMatch,
  onRefresh,
}: {
  matches: AdminMatch[];
  updatingMatch: string | null;
  setUpdatingMatch: (id: string | null) => void;
  onRefresh: () => void;
}) {
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleUpdateResult(matchId: string) {
    const s1 = parseInt(score1);
    const s2 = parseInt(score2);
    if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) {
      toast.error("Enter valid scores");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/update-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, team1Score: s1, team2Score: s2 }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
        return;
      }

      toast.success("Result updated and predictions scored!");
      setUpdatingMatch(null);
      setScore1("");
      setScore2("");
      onRefresh();
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => (
        <div key={m.id} className="bg-card border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="font-bold text-base">
                {m.team1} vs {m.team2}
              </span>
              <span className="text-xs text-muted-foreground ml-3">
                {new Date(m.matchDate).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 ${
                  m.status === "FINISHED"
                    ? "badge-correct"
                    : m.status === "LIVE"
                      ? "badge-live"
                      : m.status === "MANUAL_REVIEW"
                        ? "bg-accent-amber/10 text-accent-amber border border-accent-amber/25"
                        : "badge-pending"
                }`}
              >
                {m.status}
              </span>
              <span className="text-xs text-muted-foreground">
                {m.predictionCount} predictions
              </span>
            </div>
          </div>

          {m.status === "FINISHED" && m.team1Score !== null && (
            <p className="text-sm text-text-sub mb-2">
              Score: <span className="font-bold text-foreground">{m.team1Score} : {m.team2Score}</span>
              {m.result && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({m.result.replace("_", " ")})
                </span>
              )}
            </p>
          )}

          {(m.status === "PENDING" || m.status === "MANUAL_REVIEW" || m.status === "LIVE") && (
            <>
              {updatingMatch === m.id ? (
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    type="number"
                    min="0"
                    placeholder={m.team1}
                    value={score1}
                    onChange={(e) => { setScore1(e.target.value); setConfirming(false); }}
                    className="w-20 bg-secondary border-border"
                    aria-label={`${m.team1} score`}
                  />
                  <span className="text-muted-foreground">:</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder={m.team2}
                    value={score2}
                    onChange={(e) => { setScore2(e.target.value); setConfirming(false); }}
                    className="w-20 bg-secondary border-border"
                    aria-label={`${m.team2} score`}
                  />
                  {confirming ? (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateResult(m.id)}
                      disabled={submitting}
                      className="bg-destructive hover:bg-destructive/90 text-xs font-bold text-white"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : (
                        "Confirm"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setConfirming(true)}
                      className="bg-primary hover:bg-primary/90 text-xs font-bold"
                    >
                      Save
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setUpdatingMatch(null); setConfirming(false); }}
                    className="text-xs border-border"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUpdatingMatch(m.id);
                    setScore1(m.team1Score?.toString() ?? "");
                    setScore2(m.team2Score?.toString() ?? "");
                  }}
                  className="mt-2 text-xs border-border hover:border-primary"
                >
                  Enter Result Manually
                </Button>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function UsersTab({ users }: { users: AdminUser[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Predictions</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="font-semibold">{u.name}</td>
              <td className="text-text-sub">{u.email}</td>
              <td>{u.predictionCount}</td>
              <td className="text-muted-foreground text-xs">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No users yet</p>
      )}
    </div>
  );
}

function PredictionsTab({
  predictions,
}: {
  predictions: AdminPrediction[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Match</th>
            <th>Prediction</th>
            <th>Result</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p) => (
            <tr key={p.id}>
              <td>
                <span className="font-semibold">{p.userName}</span>
                <br />
                <span className="text-xs text-muted-foreground">
                  {p.userEmail}
                </span>
              </td>
              <td>{p.matchLabel}</td>
              <td className="font-semibold text-sm">
                {p.prediction.replace("_", " ")}
              </td>
              <td>
                {p.isCorrect === true && (
                  <span className="text-accent-green font-bold text-xs">
                    Correct
                  </span>
                )}
                {p.isCorrect === false && (
                  <span className="text-accent-red/60 font-bold text-xs">
                    Wrong
                  </span>
                )}
                {p.isCorrect === null && (
                  <span className="text-muted-foreground text-xs">--</span>
                )}
              </td>
              <td className="text-muted-foreground text-xs">
                {new Date(p.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {predictions.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No predictions yet
        </p>
      )}
    </div>
  );
}

function PromosTab({ promoCodes }: { promoCodes: AdminPromo[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>User</th>
            <th>Match</th>
            <th>Sent</th>
          </tr>
        </thead>
        <tbody>
          {promoCodes.map((pc) => (
            <tr key={pc.id}>
              <td className="font-mono font-bold text-primary tracking-wider">
                {pc.code}
              </td>
              <td>{pc.userName}</td>
              <td>{pc.matchLabel}</td>
              <td className="text-xs text-muted-foreground">
                {pc.sentAt
                  ? new Date(pc.sentAt).toLocaleString()
                  : "Not sent"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {promoCodes.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No promo codes issued yet
        </p>
      )}
    </div>
  );
}
