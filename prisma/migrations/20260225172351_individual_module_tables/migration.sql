/*
  Warnings:

  - You are about to drop the column `dashboardStructure` on the `Dashboard` table. All the data in the column will be lost.
  - You are about to drop the column `isShared` on the `Dashboard` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ModuleType" AS ENUM ('notes', 'stopwatch', 'coinToss', 'dice', 'counter', 'scoreTable');

-- CreateEnum
CREATE TYPE "CoinResult" AS ENUM ('heads', 'tails');

-- CreateEnum
CREATE TYPE "DiceType" AS ENUM ('d4', 'd6', 'd8', 'd10', 'd12', 'd16', 'd20');

-- DropIndex
DROP INDEX "Dashboard_isShared_idx";

-- AlterTable
ALTER TABLE "Dashboard" DROP COLUMN "dashboardStructure",
DROP COLUMN "isShared";

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "dashboardId" INTEGER NOT NULL,
    "name" VARCHAR(250) NOT NULL,
    "index" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "moduleType" "ModuleType" NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "w" INTEGER NOT NULL,
    "h" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotesModule" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "NotesModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StopwatchModule" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Stopwatch',
    "countUp" BOOLEAN NOT NULL DEFAULT true,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "StopwatchModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinTossModule" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Coin Toss',
    "lastResult" "CoinResult",
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CoinTossModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiceModule" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Dice',
    "value" INTEGER NOT NULL DEFAULT 1,
    "diceType" "DiceType" NOT NULL DEFAULT 'd6',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "DiceModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CounterModule" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Counter',
    "value" INTEGER NOT NULL DEFAULT 0,
    "defaultValue" INTEGER NOT NULL DEFAULT 0,
    "increment" INTEGER NOT NULL DEFAULT 1,
    "min" INTEGER,
    "max" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CounterModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreTableModule" (
    "id" SERIAL NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Game Score',
    "currentRound" INTEGER NOT NULL DEFAULT 0,
    "players" JSONB NOT NULL,
    "scores" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ScoreTableModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Page_dashboardId_idx" ON "Page"("dashboardId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_dashboardId_index_key" ON "Page"("dashboardId", "index");

-- CreateIndex
CREATE INDEX "Module_pageId_idx" ON "Module"("pageId");

-- CreateIndex
CREATE INDEX "Module_moduleType_idx" ON "Module"("moduleType");

-- CreateIndex
CREATE UNIQUE INDEX "NotesModule_moduleId_key" ON "NotesModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "StopwatchModule_moduleId_key" ON "StopwatchModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "CoinTossModule_moduleId_key" ON "CoinTossModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "DiceModule_moduleId_key" ON "DiceModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "CounterModule_moduleId_key" ON "CounterModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreTableModule_moduleId_key" ON "ScoreTableModule"("moduleId");

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "NotesModule" ADD CONSTRAINT "NotesModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "StopwatchModule" ADD CONSTRAINT "StopwatchModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CoinTossModule" ADD CONSTRAINT "CoinTossModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "DiceModule" ADD CONSTRAINT "DiceModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "CounterModule" ADD CONSTRAINT "CounterModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "ScoreTableModule" ADD CONSTRAINT "ScoreTableModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
