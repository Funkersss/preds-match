import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const matches = await prisma.match.findMany({
    orderBy: { matchDate: "asc" },
  });

  return NextResponse.json({ matches });
}
