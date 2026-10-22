-- CreateEnum
CREATE TYPE "DecisionAction" AS ENUM ('CONFIRM', 'REASSIGN', 'EXCLUDE');

-- CreateTable
CREATE TABLE "DemoSession" (
    "id" UUID NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "minute" INTEGER NOT NULL,
    "moment" TEXT NOT NULL,
    "detectedNumber" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "frameNumber" INTEGER NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipDecision" (
    "clipId" UUID NOT NULL,
    "action" "DecisionAction" NOT NULL,
    "toNumber" INTEGER,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClipDecision_pkey" PRIMARY KEY ("clipId")
);

-- CreateTable
CREATE TABLE "ParentReport" (
    "clipId" UUID NOT NULL,
    "playerNumber" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParentReport_pkey" PRIMARY KEY ("clipId")
);

-- CreateIndex
CREATE INDEX "DemoSession_lastSeenAt_idx" ON "DemoSession"("lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "Player_sessionId_number_key" ON "Player"("sessionId", "number");

-- CreateIndex
CREATE INDEX "Clip_sessionId_idx" ON "Clip"("sessionId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DemoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "DemoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipDecision" ADD CONSTRAINT "ClipDecision_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentReport" ADD CONSTRAINT "ParentReport_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;
