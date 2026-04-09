#!/bin/bash
# ══════════════════════════════════════════════════════════════════
# Official AI — Setup Verification Script
# Run this before deploying to check all env vars are set
# Usage: bash scripts/verify-setup.sh
# ══════════════════════════════════════════════════════════════════

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

check_required() {
  local var_name=$1
  local description=$2
  local value="${!var_name}"

  if [ -z "$value" ]; then
    echo -e "  ${RED}MISSING${NC}  $var_name — $description"
    ((FAIL++))
  elif [ "$value" = "GENERATE_A_REAL_SECRET" ] || [ "$value" = "GENERATE_ME" ] || [ "$value" = "your-nextauth-secret-here" ]; then
    echo -e "  ${RED}PLACEHOLDER${NC}  $var_name — still has placeholder value"
    ((FAIL++))
  else
    echo -e "  ${GREEN}OK${NC}       $var_name"
    ((PASS++))
  fi
}

check_optional() {
  local var_name=$1
  local description=$2
  local value="${!var_name}"

  if [ -z "$value" ]; then
    echo -e "  ${YELLOW}MISSING${NC}  $var_name — $description (optional)"
    ((WARN++))
  else
    echo -e "  ${GREEN}OK${NC}       $var_name"
    ((PASS++))
  fi
}

echo ""
echo "══════════════════════════════════════════════"
echo "  Official AI — Setup Verification"
echo "══════════════════════════════════════════════"
echo ""

echo "── Critical (app won't work without these) ──"
check_required DATABASE_URL "PostgreSQL connection string"
check_required NEXTAUTH_SECRET "NextAuth session encryption"
check_required FAL_API_KEY "Video generation (FAL AI)"
check_required GOOGLE_AI_STUDIO_KEY "Content planning (Gemini)"

echo ""
echo "── Payments (can't charge without these) ─────"
check_required STRIPE_SECRET_KEY "Stripe payment processing"
check_required STRIPE_WEBHOOK_SECRET "Stripe webhook verification"
check_required STRIPE_PRICE_STARTER "Stripe price ID for $79/mo plan"

echo ""
echo "── Storage (videos disappear without this) ───"
check_required SUPABASE_URL "File storage endpoint"
check_required SUPABASE_ANON_KEY "File storage auth key"

echo ""
echo "── Voice & AI Agents ─────────────────────────"
check_optional ELEVENLABS_API_KEY "Voice cloning (videos will be silent without)"
check_optional OPENROUTER_API_KEY "Claude research agents"
check_optional EXA_API_KEY "Semantic web search for research"
check_optional FIRECRAWL_API_KEY "Website scraping for research"

echo ""
echo "── Publishing ────────────────────────────────"
check_optional POST_BRIDGE_API_KEY "Auto-publish to social platforms"
check_optional CRON_SECRET "Scheduled post cron authentication"

echo ""
echo "── Email ─────────────────────────────────────"
check_optional SMTP_HOST "Email delivery (SMTP)"
check_optional SMTP_PASS "Email delivery password"

echo ""
echo "── Social OAuth ──────────────────────────────"
check_optional INSTAGRAM_CLIENT_ID "Instagram account linking"
check_optional LINKEDIN_CLIENT_ID "LinkedIn account linking"
check_optional TIKTOK_CLIENT_ID "TikTok account linking"
check_optional YOUTUBE_CLIENT_ID "YouTube account linking"

echo ""
echo "── Monitoring ────────────────────────────────"
check_optional SENTRY_DSN "Error tracking (Sentry)"

echo ""
echo "── Admin ─────────────────────────────────────"
check_required ADMIN_EMAILS "Admin access control"

echo ""
echo "══════════════════════════════════════════════"
echo -e "  ${GREEN}$PASS passed${NC}  ${RED}$FAIL failed${NC}  ${YELLOW}$WARN warnings${NC}"
echo "══════════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo ""
  echo -e "  ${RED}NOT READY FOR LAUNCH${NC} — fix the $FAIL failed checks above"
  echo ""
  exit 1
else
  echo ""
  echo -e "  ${GREEN}READY FOR LAUNCH${NC}"
  echo ""
  exit 0
fi
