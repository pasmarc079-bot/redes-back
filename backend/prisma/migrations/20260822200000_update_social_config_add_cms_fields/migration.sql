-- AlterTable: Add new columns to SocialConfig
ALTER TABLE "social_configs" ADD COLUMN "icon_name" VARCHAR(50);
ALTER TABLE "social_configs" ADD COLUMN "color" VARCHAR(7);
ALTER TABLE "social_configs" ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0;

-- DropTable: Remove old tables that are no longer used
DROP TABLE IF EXISTS "member_badges" CASCADE;
DROP TABLE IF EXISTS "members" CASCADE;
DROP TABLE IF EXISTS "badges" CASCADE;

-- DropEnum: Remove old enum
DROP TYPE IF EXISTS "BadgeType" CASCADE;
