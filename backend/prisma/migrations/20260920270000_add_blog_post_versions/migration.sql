CREATE TABLE "blog_post_versions" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" VARCHAR(300) NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" VARCHAR(500),
    "cover_image_url" TEXT,
    "status" "PostStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMP(3),
    "seo_title" VARCHAR(200),
    "seo_description" VARCHAR(300),
    "og_image_url" TEXT,
    "tag_ids" JSONB NOT NULL DEFAULT '[]',
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_post_versions_pkey" PRIMARY KEY ("id")
);

INSERT INTO "blog_post_versions" (
  "id", "post_id", "version", "title", "content", "excerpt", "cover_image_url",
  "status", "published_at", "seo_title", "seo_description", "og_image_url", "tag_ids", "is_current", "updated_at"
)
SELECT
  'version-' || bp."id" || '-1',
  bp."id",
  1,
  bp."title",
  bp."content",
  bp."excerpt",
  bp."cover_image_url",
  bp."status",
  bp."published_at",
  bp."seo_title",
  bp."seo_description",
  bp."og_image_url",
  COALESCE((SELECT jsonb_agg(pt."tag_id") FROM "post_tags" pt WHERE pt."post_id" = bp."id"), '[]'::jsonb),
  true,
  CURRENT_TIMESTAMP
FROM "blog_posts" bp;

ALTER TABLE "blog_post_versions"
  ADD CONSTRAINT "blog_post_versions_post_id_fkey"
  FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "blog_post_versions_post_id_version_key" ON "blog_post_versions"("post_id", "version");
CREATE INDEX "blog_post_versions_post_id_status_idx" ON "blog_post_versions"("post_id", "status");
