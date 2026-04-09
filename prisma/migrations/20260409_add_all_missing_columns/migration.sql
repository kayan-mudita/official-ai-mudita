-- Add selectedPose to CharacterSheet (from pose selection feature)
ALTER TABLE "CharacterSheet" ADD COLUMN IF NOT EXISTS "selectedPose" INTEGER;

-- Add onboardingProgress to User (from skip path persistence)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingProgress" TEXT;

-- Add approvedDays to ResearchSession (from calendar approval)
ALTER TABLE "ResearchSession" ADD COLUMN IF NOT EXISTS "approvedDays" TEXT;

-- Create VideoTemplate table (from reference template system)
CREATE TABLE IF NOT EXISTS "VideoTemplate" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "analysisJson" TEXT NOT NULL,
    "transcript" TEXT,
    "duration" DOUBLE PRECISION,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoTemplate_pkey" PRIMARY KEY ("id")
);

-- Create index for VideoTemplate
CREATE INDEX IF NOT EXISTS "VideoTemplate_userId_createdAt_idx" ON "VideoTemplate"("userId", "createdAt");

-- Create ResearchSession table if not exists (idempotent — may already exist)
CREATE TABLE IF NOT EXISTS "ResearchSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "companyName" TEXT,
    "websiteUrl" TEXT,
    "businessStatus" TEXT NOT NULL DEFAULT 'queued',
    "businessResult" TEXT,
    "trendsStatus" TEXT NOT NULL DEFAULT 'queued',
    "trendsResult" TEXT,
    "competitorStatus" TEXT NOT NULL DEFAULT 'queued',
    "competitorResult" TEXT,
    "calendarStatus" TEXT NOT NULL DEFAULT 'queued',
    "calendarResult" TEXT,
    "approvedDays" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ResearchSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ResearchSession_userId_createdAt_idx" ON "ResearchSession"("userId", "createdAt");
