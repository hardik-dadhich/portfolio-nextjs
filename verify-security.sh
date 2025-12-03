#!/bin/bash

# Security Verification Script
# Run this before pushing to GitHub

echo "🔒 Security Verification Script"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: .env.local is ignored
echo "1️⃣  Checking .env.local is ignored..."
if git check-ignore .env.local > /dev/null 2>&1; then
    echo -e "${GREEN}✅ .env.local is properly ignored${NC}"
else
    echo -e "${RED}❌ ERROR: .env.local is NOT ignored!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Database files are ignored
echo "2️⃣  Checking database files are ignored..."
if git check-ignore database/blog.db > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database files are properly ignored${NC}"
else
    echo -e "${RED}❌ ERROR: Database files are NOT ignored!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: node_modules is ignored
echo "3️⃣  Checking node_modules is ignored..."
if git check-ignore node_modules > /dev/null 2>&1; then
    echo -e "${GREEN}✅ node_modules is properly ignored${NC}"
else
    echo -e "${RED}❌ ERROR: node_modules is NOT ignored!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 4: No .env files in staging
echo "4️⃣  Checking for .env files in git status..."
if git status --porcelain | grep -q "\.env\.local"; then
    echo -e "${RED}❌ ERROR: .env.local is in git status!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env.local in git status${NC}"
fi

# Check 5: No database files in staging
echo "5️⃣  Checking for database files in git status..."
if git status --porcelain | grep -q "\.db"; then
    echo -e "${RED}❌ ERROR: Database files are in git status!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No database files in git status${NC}"
fi

# Check 6: No hardcoded passwords in TypeScript files
echo "6️⃣  Scanning for hardcoded passwords..."
if grep -r "password.*=.*['\"]" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".next" | grep -v "password.*process.env" | grep -v "password.*=.*['\"]['\"]" | grep -v "password.*=.*['\"]\$" | grep -q .; then
    echo -e "${YELLOW}⚠️  WARNING: Possible hardcoded passwords found${NC}"
    echo "   Review these lines carefully:"
    grep -r "password.*=.*['\"]" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ".next" | grep -v "password.*process.env" | grep -v "password.*=.*['\"]['\"]" | head -3
else
    echo -e "${GREEN}✅ No hardcoded passwords detected${NC}"
fi

# Check 7: .gitignore exists
echo "7️⃣  Checking .gitignore exists..."
if [ -f .gitignore ]; then
    echo -e "${GREEN}✅ .gitignore file exists${NC}"
else
    echo -e "${RED}❌ ERROR: .gitignore file missing!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 8: .env.example exists
echo "8️⃣  Checking .env.example exists..."
if [ -f .env.example ]; then
    echo -e "${GREEN}✅ .env.example file exists${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: .env.example file missing${NC}"
fi

echo ""
echo "================================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    echo -e "${GREEN}🚀 Safe to push to GitHub${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS security check(s) failed!${NC}"
    echo -e "${RED}⛔ DO NOT push to GitHub yet${NC}"
    echo ""
    echo "Fix the errors above before pushing."
    exit 1
fi
