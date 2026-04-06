-- CreateTable
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
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ResearchSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ResearchSession_userId_createdAt_idx" ON "ResearchSession"("userId", "createdAt");
ALTER TABLE "ResearchSession" ADD COLUMN IF NOT EXISTS "approvedDays" TEXT;
