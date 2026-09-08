/*
  Warnings:

  - You are about to drop the column `countUp` on the `StopwatchModule` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `StopwatchModule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StopwatchModule" DROP COLUMN "countUp",
DROP COLUMN "value",
ADD COLUMN     "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mode" VARCHAR(20) NOT NULL DEFAULT 'stopwatch',
ADD COLUMN     "startedAt" BIGINT,
ADD COLUMN     "timerMinutes" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "timerSeconds" INTEGER NOT NULL DEFAULT 0;
