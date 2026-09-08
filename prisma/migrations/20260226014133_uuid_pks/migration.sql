/*
  Warnings:

  - The primary key for the `CoinTossModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `coinTossModuleId` on the `CoinTossModule` table. All the data in the column will be lost.
  - The primary key for the `CounterModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `counterModuleId` on the `CounterModule` table. All the data in the column will be lost.
  - The primary key for the `Dashboard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DiceModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `diceModuleId` on the `DiceModule` table. All the data in the column will be lost.
  - The primary key for the `Module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `NotesModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `notesModuleId` on the `NotesModule` table. All the data in the column will be lost.
  - The primary key for the `Page` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ScoreTableModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `scoreTableModuleId` on the `ScoreTableModule` table. All the data in the column will be lost.
  - The primary key for the `StopwatchModule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `stopwatchModuleId` on the `StopwatchModule` table. All the data in the column will be lost.

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

-- DropIndex
DROP INDEX "CoinTossModule_moduleId_key";

-- DropIndex
DROP INDEX "CounterModule_moduleId_key";

-- DropIndex
DROP INDEX "DiceModule_moduleId_key";

-- DropIndex
DROP INDEX "NotesModule_moduleId_key";

-- DropIndex
DROP INDEX "ScoreTableModule_moduleId_key";

-- DropIndex
DROP INDEX "StopwatchModule_moduleId_key";

-- AlterTable
ALTER TABLE "CoinTossModule" DROP CONSTRAINT "CoinTossModule_pkey",
DROP COLUMN "coinTossModuleId",
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CoinTossModule_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "CounterModule" DROP CONSTRAINT "CounterModule_pkey",
DROP COLUMN "counterModuleId",
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CounterModule_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "Dashboard" DROP CONSTRAINT "Dashboard_pkey",
ALTER COLUMN "copiedFromId" SET DATA TYPE TEXT,
ALTER COLUMN "dashboardId" DROP DEFAULT,
ALTER COLUMN "dashboardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("dashboardId");
DROP SEQUENCE "Dashboard_dashboardId_seq";

-- AlterTable
ALTER TABLE "DashboardTag" ALTER COLUMN "dashboardId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "DiceModule" DROP CONSTRAINT "DiceModule_pkey",
DROP COLUMN "diceModuleId",
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DiceModule_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "Module" DROP CONSTRAINT "Module_pkey",
ALTER COLUMN "pageId" SET DATA TYPE TEXT,
ALTER COLUMN "moduleId" DROP DEFAULT,
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Module_pkey" PRIMARY KEY ("moduleId");
DROP SEQUENCE "Module_moduleId_seq";

-- AlterTable
ALTER TABLE "NotesModule" DROP CONSTRAINT "NotesModule_pkey",
DROP COLUMN "notesModuleId",
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "NotesModule_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "Page" DROP CONSTRAINT "Page_pkey",
ALTER COLUMN "dashboardId" SET DATA TYPE TEXT,
ALTER COLUMN "pageId" DROP DEFAULT,
ALTER COLUMN "pageId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Page_pkey" PRIMARY KEY ("pageId");
DROP SEQUENCE "Page_pageId_seq";

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "dashboardId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "ScoreTableModule" DROP CONSTRAINT "ScoreTableModule_pkey",
DROP COLUMN "scoreTableModuleId",
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ScoreTableModule_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "StopwatchModule" DROP CONSTRAINT "StopwatchModule_pkey",
DROP COLUMN "stopwatchModuleId",
ALTER COLUMN "moduleId" SET DATA TYPE TEXT,
ADD CONSTRAINT "StopwatchModule_pkey" PRIMARY KEY ("moduleId");

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "dashboardId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "votes" ALTER COLUMN "dashboard_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_copiedFromId_fkey" FOREIGN KEY ("copiedFromId") REFERENCES "Dashboard"("dashboardId") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DashboardTag" ADD CONSTRAINT "DashboardTag_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("dashboardId") ON DELETE CASCADE ON UPDATE NO ACTION;

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
