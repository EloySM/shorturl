-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('OWNER', 'ADMIN', 'VIEWER');

-- CreateTable
CREATE TABLE "clicks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "link_id" UUID,
    "ip_hash" TEXT,
    "ip_display" TEXT,
    "continent" TEXT,
    "country_code" TEXT,
    "country_region" TEXT,
    "city" TEXT,
    "device_type" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "os" TEXT,
    "browser" TEXT,
    "detected_source" TEXT,
    "referrer" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "is_unique" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "test" TEXT,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "short_code" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "organization_id" UUID,
    "creator_id" UUID,
    "expires_at" TIMESTAMPTZ(6),
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "pass_query_params" BOOLEAN DEFAULT true,
    "link_cloaking" BOOLEAN DEFAULT false,
    "is_unsafe" BOOLEAN DEFAULT false,
    "ios_url" TEXT,
    "android_url" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID,
    "user_id" UUID,
    "role" "user_role" DEFAULT 'VIEWER',

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clicks_link_id_idx" ON "clicks"("link_id");

-- CreateIndex
CREATE INDEX "clicks_ip_hash_idx" ON "clicks"("ip_hash");

-- CreateIndex
CREATE UNIQUE INDEX "links_short_code_key" ON "links"("short_code");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_organization_id_user_id_key" ON "memberships"("organization_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "links" ADD CONSTRAINT "links_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
