/*
  Warnings:

  - The primary key for the `CoinTossModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CoinTossModule` table. All the data in the column will be lost.
  - The primary key for the `CounterModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CounterModule` table. All the data in the column will be lost.
  - The primary key for the `Dashboard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Dashboard` table. All the data in the column will be lost.
  - The primary key for the `DashboardTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DashboardTag` table. All the data in the column will be lost.
  - The primary key for the `DiceModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `DiceModule` table. All the data in the column will be lost.
  - The primary key for the `Module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Module` table. All the data in the column will be lost.
  - The primary key for the `NotesModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `NotesModule` table. All the data in the column will be lost.
  - The primary key for the `Page` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Page` table. All the data in the column will be lost.
  - The primary key for the `Report` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Report` table. All the data in the column will be lost.
  - The primary key for the `ScoreTableModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ScoreTableModule` table. All the data in the column will be lost.
  - The primary key for the `StopwatchModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StopwatchModule` table. All the data in the column will be lost.
  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Subscription` table. All the data in the column will be lost.
  - The primary key for the `Tag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Tag` table. All the data in the column will be lost.
  - The primary key for the `votes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `votes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CoinTossModule" DROP CONSTRAINT "CoinTossModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "CounterModule" DROP CONSTRAINT "CounterModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Dashboard" DROP CONSTRAINT "Dashboard_copiedFromId_fkey";

-- DropForeignKey
ALTER TABLE "DashboardTag" DROP CONSTRAINT "DashboardTag_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "DashboardTag" DROP CONSTRAINT "DashboardTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "DiceModule" DROP CONSTRAINT "DiceModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Module" DROP CONSTRAINT "Module_pageId_fkey";

-- DropForeignKey
ALTER TABLE "NotesModule" DROP CONSTRAINT "NotesModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Page" DROP CONSTRAINT "Page_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreTableModule" DROP CONSTRAINT "ScoreTableModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "StopwatchModule" DROP CONSTRAINT "StopwatchModule_moduleId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_dashboardId_fkey";

-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "fk_votes_dashboard";

-- AlterTable
ALTER TABLE "CoinTossModule" DROP CONSTRAINT "CoinTossModule_pkey",
DROP COLUMN "id",
ADD COLUMN     "coinTossModuleId" SERIAL NOT NULL,
ADD CONSTRAINT "CoinTossModule_pkey" PRIMARY KEY ("coinTossModuleId");

-- AlterTable
ALTER TABLE "CounterModule" DROP CONSTRAINT "CounterModule_pkey",
DROP COLUMN "id",
ADD COLUMN     "counterModuleId" SERIAL NOT NULL,
ADD CONSTRAINT "CounterModule_pkey" PRIMARY KEY ("counterModuleId");

-- AlterTable
ALTER TABLE "Dashboard" DROP CONSTRAINT "Dashboard_pkey",
DROP COLUMN "id",
ADD COLUMN     "dashboardId" SERIAL NOT NULL,
ADD CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("dashboardId");

-- AlterTable
ALTER TABLE "DashboardTag" DROP CONSTRAINT "DashboardTag_pkey",
DROP COLUMN "id",
ADD COLUMN     "dashboardTagId" SERIAL NOT NULL,
ADD CONSTRAINT "DashboardTag_pkey" PRIMARY KEY ("dashboardTagId");

-- AlterTable
ALTER TABLE "DiceModule" DROP CONSTRAINT "DiceModule_pkey",
DROP COLUMN "id",
ADD COLUMN     "diceModuleId" SERIAL NOT NULL,
ADD CONSTRAINT "DiceModule_pkey" PRIMARY KEY ("diceModuleId");

-- AlterTable
ALTER TABLE "Module" DROP CONSTRAINT "Module_pkey",
DROP COLUMN "id",
ADD COLUMN     "moduleId" SERIAL NOT NULL,
ADD CONSTRAINT "Module_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "NotesModule" DROP CONSTRAINT "NotesModule_pkey",
DROP COLUMN "id",
ADD COLUMN     "notesModuleId" SERIAL NOT NULL,
ADD CONSTRAINT "NotesModule_pkey" PRIMARY KEY ("notesModuleId");

-- AlterTable
ALTER TABLE "Page" DROP CONSTRAINT "Page_pkey",
DROP COLUMN "id",
ADD COLUMN     "pageId" SERIAL NOT NULL,
ADD CONSTRAINT "Page_pkey" PRIMARY KEY ("pageId");

-- AlterTable
ALTER TABLE "Report" DROP CONSTRAINT "Report_pkey",
DROP COLUMN "id",
ADD COLUMN     "reportId" SERIAL NOT NULL,
ADD CONSTRAINT "Report_pkey" PRIMARY KEY ("reportId");

-- AlterTable
ALTER TABLE "ScoreTableModule" DROP CONSTRAINT "ScoreTableModule_pkey",
DROP COLUMN "id",
ADD COLUMN     "scoreTableModuleId" SERIAL NOT NULL,
ADD CONSTRAINT "ScoreTableModule_pkey" PRIMARY KEY ("scoreTableModuleId");

-- AlterTable
ALTER TABLE "StopwatchModule" DROP CONSTRAINT "StopwatchModule_pkey",
DROP COLUMN "id",
ADD COLUMN     "stopwatchModuleId" SERIAL NOT NULL,
ADD CONSTRAINT "StopwatchModule_pkey" PRIMARY KEY ("stopwatchModuleId");

-- AlterTable
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_pkey",
DROP COLUMN "id",
ADD COLUMN     "subscriptionId" SERIAL NOT NULL,
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscriptionId");

-- AlterTable
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_pkey",
DROP COLUMN "id",
ADD COLUMN     "tagId" SERIAL NOT NULL,
ADD CONSTRAINT "Tag_pkey" PRIMARY KEY ("tagId");

-- AlterTable
ALTER TABLE "votes" DROP CONSTRAINT "votes_pkey",
DROP COLUMN "id",
ADD COLUMN     "voteId" SERIAL NOT NULL,
ADD CONSTRAINT "votes_pkey" PRIMARY KEY ("voteId");

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Dashboard"("dashboardId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DashboardTag" ADD CONSTRAINT "DashboardTag_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("dashboardId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DashboardTag" ADD CONSTRAINT "DashboardTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("tagId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("dashboardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("dashboardId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "fk_votes_dashboard" FOREIGN KEY ("dashboard_id") REFERENCES "Dashboard"("dashboardId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("dashboardId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("pageId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NotesModule" ADD CONSTRAINT "NotesModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StopwatchModule" ADD CONSTRAINT "StopwatchModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CoinTossModule" ADD CONSTRAINT "CoinTossModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DiceModule" ADD CONSTRAINT "DiceModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CounterModule" ADD CONSTRAINT "CounterModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ScoreTableModule" ADD CONSTRAINT "ScoreTableModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;
