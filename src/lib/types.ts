export type MatchStatus = "PENDING" | "LIVE" | "FINISHED" | "MANUAL_REVIEW";
export type Outcome = "TEAM1_WIN" | "DRAW" | "TEAM2_WIN";

export interface MatchData {
  id: string;
  team1: string;
  team2: string;
  team1Code: string;
  team2Code: string;
  matchDate: string;
  status: MatchStatus;
  result: Outcome | null;
  team1Score: number | null;
  team2Score: number | null;
}

export interface PredictionData {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  isCorrect: boolean | null;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
}

export interface PromoCodeData {
  id: string;
  code: string;
  matchId: string;
  sentAt: string | null;
  match?: MatchData;
}
