-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sid" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "stateJson" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Record" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rank" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "durationSec" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Game_sid_idx" ON "Game"("sid");

-- CreateIndex
CREATE INDEX "Record_score_idx" ON "Record"("score");
