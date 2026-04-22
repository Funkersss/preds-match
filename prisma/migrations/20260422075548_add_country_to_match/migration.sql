-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "country" TEXT NOT NULL DEFAULT 'NO';

-- AlterTable
ALTER TABLE "predictions" ALTER COLUMN "home_score" DROP DEFAULT,
ALTER COLUMN "away_score" DROP DEFAULT;
