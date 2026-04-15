-- AddColumn: venue to matches
ALTER TABLE "matches" ADD COLUMN "venue" TEXT;

-- Fix TBD → Iraq for the Norway match + set venue
UPDATE "matches"
SET "team1" = 'Iraq', "team1_code" = 'IRQ', "venue" = 'Gillette Stadium, Boston'
WHERE "team1" = 'TBD' AND "team2" = 'Norway';

-- Set venue for Norway vs Senegal
UPDATE "matches"
SET "venue" = 'MetLife Stadium, New York/NJ'
WHERE "team1" = 'Norway' AND "team2" = 'Senegal';

-- Set venue for Norway vs France (if that match exists)
UPDATE "matches"
SET "venue" = 'Levi''s Stadium, San Francisco'
WHERE ("team1" = 'Norway' AND "team2" = 'France')
   OR ("team1" = 'France' AND "team2" = 'Norway');
