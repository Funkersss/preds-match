const BASE_URL = "https://api.football-data.org/v4";

interface ApiMatchScore {
  fullTime: { home: number | null; away: number | null };
}

interface ApiMatch {
  id: number;
  status: string;
  score: ApiMatchScore;
  homeTeam: { name: string; tla: string };
  awayTeam: { name: string; tla: string };
}

export async function fetchMatchResult(apiMatchId: number): Promise<{
  status: string;
  homeScore: number | null;
  awayScore: number | null;
} | null> {
  const apiKey = process.env.FOOTBALL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`${BASE_URL}/matches/${apiMatchId}`, {
      headers: { "X-Auth-Token": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Football API error: ${res.status} ${res.statusText}`);
      return null;
    }

    const data: ApiMatch = await res.json();
    return {
      status: data.status,
      homeScore: data.score.fullTime.home,
      awayScore: data.score.fullTime.away,
    };
  } catch (error) {
    console.error("Football API fetch error:", error);
    return null;
  }
}

export function determineOutcome(
  homeScore: number,
  awayScore: number
): "TEAM1_WIN" | "DRAW" | "TEAM2_WIN" {
  if (homeScore > awayScore) return "TEAM1_WIN";
  if (homeScore < awayScore) return "TEAM2_WIN";
  return "DRAW";
}
