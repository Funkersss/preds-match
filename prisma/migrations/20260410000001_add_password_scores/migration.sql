-- AlterTable: add password_hash to users (nullable for existing rows)
ALTER TABLE "users" ADD COLUMN "password_hash" TEXT;

-- AlterTable: replace prediction outcome with score fields
ALTER TABLE "predictions" DROP COLUMN "prediction";
ALTER TABLE "predictions" ADD COLUMN "home_score" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "predictions" ADD COLUMN "away_score" INTEGER NOT NULL DEFAULT 0;
