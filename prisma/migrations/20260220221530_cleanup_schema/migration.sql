/*
  Warnings:

  - You are about to drop the `dashboards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `dashboardtags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subscriptions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tags` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `vote_type` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Made the column `created_at` on table `votes` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('up', 'down');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('pending', 'resolved', 'rejected');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('offensive_name', 'offensive_content', 'harassment', 'spam', 'scam_or_phishing', 'copyright', 'other');

-- DropForeignKey
ALTER TABLE "dashboards" DROP CONSTRAINT "fk_dashboards_copied_from";

-- DropForeignKey
ALTER TABLE "dashboards" DROP CONSTRAINT "fk_dashboards_owner";

-- DropForeignKey
ALTER TABLE "dashboardtags" DROP CONSTRAINT "fk_dashboard_tags_dashboard";

-- DropForeignKey
ALTER TABLE "dashboardtags" DROP CONSTRAINT "fk_dashboard_tags_tag";

-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "fk_reports_dashboard";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "fk_reports_reporter";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "fk_reports_reviewer";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "fk_subscriptions_dashboard";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "fk_subscriptions_user";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "fk_votes_dashboard";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "fk_votes_user";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "displayUsername" TEXT,
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "vote_type",
ADD COLUMN     "vote_type" "VoteType" NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL;

-- DropTable
DROP TABLE "dashboards";

-- DropTable
DROP TABLE "dashboardtags";

-- DropTable
DROP TABLE "profiles";

-- DropTable
DROP TABLE "reports";

-- DropTable
DROP TABLE "subscriptions";

-- DropTable
DROP TABLE "tags";

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" SERIAL NOT NULL,
    "ownerId" TEXT NOT NULL,
    "copiedFromId" INTEGER,
    "title" VARCHAR(250) NOT NULL,
    "description" VARCHAR(2500),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "dashboardStructure" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardTag" (
    "id" SERIAL NOT NULL,
    "dashboardId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "dashboardId" INTEGER NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" VARCHAR(200),
    "status" "ReportStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "dashboardId" INTEGER NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dashboard_createdAt_idx" ON "Dashboard"("createdAt");

-- CreateIndex
CREATE INDEX "Dashboard_isShared_idx" ON "Dashboard"("isShared");

-- CreateIndex
CREATE INDEX "Dashboard_ownerId_idx" ON "Dashboard"("ownerId");

-- CreateIndex
CREATE INDEX "Dashboard_isPublic_idx" ON "Dashboard"("isPublic");

-- CreateIndex
CREATE INDEX "DashboardTag_dashboardId_idx" ON "DashboardTag"("dashboardId");

-- CreateIndex
CREATE INDEX "DashboardTag_tagId_idx" ON "DashboardTag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardTag_dashboardId_tagId_key" ON "DashboardTag"("dashboardId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_dashboardId_idx" ON "Report"("dashboardId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_dashboardId_key" ON "Report"("reporterId", "dashboardId");

-- CreateIndex
CREATE INDEX "Subscription_dashboardId_idx" ON "Subscription"("dashboardId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_dashboardId_key" ON "Subscription"("userId", "dashboardId");

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Dashboard"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DashboardTag" ADD CONSTRAINT "DashboardTag_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DashboardTag" ADD CONSTRAINT "DashboardTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "fk_votes_dashboard" FOREIGN KEY ("dashboard_id") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "fk_votes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
