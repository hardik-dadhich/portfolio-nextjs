#!/bin/bash

# ============================================
# Security Check Script
# ============================================
# Run this before committing to GitHub
# Usage: ./scripts/security-check.sh

set -e

echo "🔒 Running Security Checks..."
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# ============================================
# 1. Check for .env files
# ============================================
echo ""
echo "📁 Checking for environment files..."

if git ls-files | grep -q "\.env$\|\.env\.local$\|\.env\.production$"; then
    echo -e "${RED}❌ ERROR: .env files found in git!${NC}"
    git ls-files | grep "\.env"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env files in git${NC}"
fi

# ============================================
# 2. Check for database files
# ============================================
echo ""
echo "🗄️  Checking for database files..."

if git ls-files | grep -q "\.db$\|\.sqlite$\|\.sqlite3$"; then
    echo -e "${RED}❌ ERROR: Database files found in git!${NC}"
    git ls-files | grep "\.db$\|\.sqlite"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No database files in git${NC}"
fi

# ============================================
# 3. Search for hardcoded secrets
# ============================================
echo ""
echo "🔑 Searching for hardcoded secrets..."

# Check for common secret patterns
SECRET_PATTERNS=(
    "password.*=.*['\"].*['\"]"
    "api[_-]?key.*=.*['\"].*['\"]"
    "secret.*=.*['\"].*['\"]"
    "token.*=.*['\"].*['\"]"
    "NEXTAUTH_SECRET.*=.*['\"].*['\"]"
)

for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -r -i -E "$pattern" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.md" --exclude="security-check.sh" . 2>/dev/null | grep -v "\.env\.example" | grep -q .; then
        echo -e "${YELLOW}⚠️  WARNING: Potential secret found matching pattern: $pattern${NC}"
        grep -r -i -E "$pattern" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.md" --exclude="security-check.sh" . 2>/dev/null | grep -v "\.env\.example" | head -3
        WARNINGS=$((WARNINGS + 1))
    fi
done

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ No obvious secrets found${NC}"
fi

# ============================================
# 4. Check for personal information
# ============================================
echo ""
echo "👤 Checking for personal information..."

# Check for email addresses (excluding example domains)
if grep -r -E "[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.com" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.md" . 2>/dev/null | grep -v "\.env\.example" | grep -q .; then
    echo -e "${YELLOW}⚠️  WARNING: Personal email addresses found${NC}"
    grep -r -E "[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.com" --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.md" . 2>/dev/null | grep -v "\.env\.example" | head -3
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No personal emails found${NC}"
fi

# ============================================
# 5. Check node_modules is ignored
# ============================================
echo ""
echo "📦 Checking build artifacts..."

if git ls-files | grep -q "node_modules/"; then
    echo -e "${RED}❌ ERROR: node_modules found in git!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ node_modules is ignored${NC}"
fi

if git ls-files | grep -q "\.next/"; then
    echo -e "${RED}❌ ERROR: .next build directory found in git!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ .next is ignored${NC}"
fi

# ============================================
# 6. Check for large files
# ============================================
echo ""
echo "📏 Checking for large files..."

LARGE_FILES=$(git ls-files | xargs ls -l 2>/dev/null | awk '$5 > 1048576 {print $9, $5}')
if [ ! -z "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Large files found (>1MB):${NC}"
    echo "$LARGE_FILES"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ No large files found${NC}"
fi

# ============================================
# 7. Run npm audit
# ============================================
echo ""
echo "🔍 Running npm audit..."

if npm audit --audit-level=high 2>&1 | grep -q "found 0 vulnerabilities"; then
    echo -e "${GREEN}✅ No high/critical vulnerabilities found${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING: Vulnerabilities found in dependencies${NC}"
    npm audit --audit-level=high
    WARNINGS=$((WARNINGS + 1))
fi

# ============================================
# 8. Check .gitignore exists
# ============================================
echo ""
echo "📝 Checking .gitignore..."

if [ ! -f ".gitignore" ]; then
    echo -e "${RED}❌ ERROR: .gitignore file not found!${NC}"
    ERRORS=$((ERRORS + 1))
else
    # Check if important patterns are in .gitignore
    REQUIRED_PATTERNS=(".env" "node_modules" ".next" "*.db")
    for pattern in "${REQUIRED_PATTERNS[@]}"; do
        if ! grep -q "$pattern" .gitignore; then
            echo -e "${YELLOW}⚠️  WARNING: '$pattern' not found in .gitignore${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
    
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}✅ .gitignore looks good${NC}"
    fi
fi

# ============================================
# Summary
# ============================================
echo ""
echo "================================"
echo "📊 Security Check Summary"
echo "================================"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ FAILED: Fix errors before committing!${NC}"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS: Review warnings before committing${NC}"
    echo "Continue anyway? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ PASSED: All security checks passed!${NC}"
fi

echo ""
echo "🚀 Safe to commit!"
