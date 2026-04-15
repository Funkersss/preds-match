-- Fix Norway vs France match: wrong date and wrong venue
-- Correct: June 26, 2026 at 3 PM ET (UTC-4) = 19:00 UTC
-- Correct: Gillette Stadium, Foxborough (not Levi's Stadium)
UPDATE "matches"
SET "match_date" = '2026-06-26 19:00:00.000',
    "venue"      = 'Gillette Stadium, Foxborough',
    "updated_at" = NOW()
WHERE ("team1" = 'Norway' AND "team2" = 'France')
   OR ("team1" = 'France' AND "team2" = 'Norway');
