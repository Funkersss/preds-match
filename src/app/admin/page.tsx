import { verifyAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminContent } from "@/components/admin-content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    return <AdminLoginGate />;
  }

  const matches = await prisma.match.findMany({
    orderBy: { matchDate: "asc" },
    include: {
      _count: { select: { predictions: true } },
    },
  });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { predictions: true } },
    },
  });

  const predictions = await prisma.prediction.findMany({
    include: { user: true, match: true },
    orderBy: { createdAt: "desc" },
  });

  const promoCodes = await prisma.promoCode.findMany({
    include: { user: true, match: true },
    orderBy: { match: { matchDate: "asc" } },
  });

  return (
    <AdminContent
      matches={matches.map((m) => ({
        ...m,
        matchDate: m.matchDate.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        predictionCount: m._count.predictions,
      }))}
      users={users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt.toISOString(),
        predictionCount: u._count.predictions,
      }))}
      predictions={predictions.map((p) => ({
        id: p.id,
        userName: p.user.name,
        userEmail: p.user.email,
        matchLabel: `${p.match.team1} vs ${p.match.team2}`,
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        isCorrect: p.isCorrect,
        createdAt: p.createdAt.toISOString(),
      }))}
      promoCodes={promoCodes.map((pc) => ({
        id: pc.id,
        code: pc.code,
        userName: pc.user.name,
        matchLabel: `${pc.match.team1} vs ${pc.match.team2}`,
        sentAt: pc.sentAt?.toISOString() ?? null,
      }))}
    />
  );
}

function AdminLoginGate() {
  return <AdminLoginForm />;
}

import { AdminLoginForm } from "@/components/admin-login-form";
