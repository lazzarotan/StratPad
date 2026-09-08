/*
  Warnings:

  - You are about to drop the column `lastResult` on the `CoinTossModule` table. All the data in the column will be lost.
  - You are about to drop the column `diceType` on the `DiceModule` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `DiceModule` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ModuleType" ADD VALUE 'spinWheel';

-- AlterTable
ALTER TABLE "CoinTossModule" DROP COLUMN "lastResult",
ADD COLUMN     "result" "CoinResult";

-- AlterTable
ALTER TABLE "DiceModule" DROP COLUMN "diceType",
DROP COLUMN "value",
ADD COLUMN     "dice" JSON NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "ScoreTableModule" ADD COLUMN     "roundNames" JSON NOT NULL DEFAULT '["Round 1", "Round 2", "Round 3"]',
ALTER COLUMN "players" SET DEFAULT '["Player 1", "Player 2"]',
ALTER COLUMN "players" SET DATA TYPE JSON,
ALTER COLUMN "scores" SET DEFAULT '[[null, null, null], [null, null, null]]',
ALTER COLUMN "scores" SET DATA TYPE JSON;

-- DropEnum
DROP TYPE "DiceType";

-- CreateTable
CREATE TABLE "SpinWheelModule" (
    "moduleId" TEXT NOT NULL,
    "title" VARCHAR(250) NOT NULL DEFAULT 'Spin Wheel',
    "segments" JSON NOT NULL DEFAULT '["1", "2", "3", "4"]',

    CONSTRAINT "SpinWheelModule_pkey" PRIMARY KEY ("moduleId")
);

-- AddForeignKey
ALTER TABLE "SpinWheelModule" ADD CONSTRAINT "SpinWheelModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("moduleId") ON DELETE CASCADE ON UPDATE NO ACTION;
