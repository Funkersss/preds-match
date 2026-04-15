-- Fix Match 1: Iraq vs Norway
-- June 16, 2026 at 6 PM ET (UTC-4) = 22:00 UTC
-- Venue: Gillette Stadium, Foxborough (Boston area)
UPDATE "matches"
SET "match_date" = '2026-06-16 22:00:00.000',
    "venue"      = 'Gillette Stadium, Foxborough',
    "updated_at" = NOW()
WHERE ("team1" IN ('Iraq', 'TBD')) AND "team2" = 'Norway';

-- Fix Match 2: Norway vs Senegal
-- June 22, 2026 at 8 PM ET (UTC-4) = June 23 00:00 UTC
-- Venue: MetLife Stadium, East Rutherford
UPDATE "matches"
SET "match_date" = '2026-06-23 00:00:00.000',
    "venue"      = 'MetLife Stadium, East Rutherford',
    "updated_at" = NOW()
WHERE "team1" = 'Norway' AND "team2" = 'Senegal';

-- Add Match 3: Norway vs France (if not already present)
-- June 26, 2026 at 3 PM ET (UTC-4) = 19:00 UTC
-- Venue: Gillette Stadium, Foxborough
INSERT INTO "matches"
    ("id", "team1", "team2", "team1_code", "team2_code",
     "match_date", "venue", "status", "updated_at")
SELECT
    gen_random_uuid()::text,
    'Norway', 'France',
    'NOR', 'FRA',
    '2026-06-26 19:00:00.000',
    'Gillette Stadium, Foxborough',
    'PENDING',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM "matches"
    WHERE ("team1" = 'Norway' AND "team2" = 'France')
       OR ("team1" = 'France' AND "team2" = 'Norway')
);
