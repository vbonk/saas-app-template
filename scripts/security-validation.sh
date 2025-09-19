#!/bin/bash

# Security Validation Script for SaaS Application Template
# Validates that the application follows secure secrets management patterns

set -e

echo "🔐 SaaS Template Security Validation"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check for forbidden patterns
check_forbidden_patterns() {
    local file=$1
    local context=$2
    
    echo "🔍 Checking $context: $file"
    
    # Check for localStorage/sessionStorage usage with secrets (exclude test files, config, and documentation)
    if grep -n "localStorage\|sessionStorage" "$file" 2>/dev/null | grep -i "key\|secret\|token\|password\|api" | grep -v -E "(test|spec|\.eslintrc|comment|//.*CRITICAL|selector|message|Ensure.*NEVER|Custom rule.*detect)" > /dev/null; then
        echo -e "${RED}❌ CRITICAL: Found browser storage of secrets in $file${NC}"
        grep -n "localStorage\|sessionStorage" "$file" | grep -i "key\|secret\|token\|password\|api" | grep -v -E "(test|spec|\.eslintrc|comment|//.*CRITICAL|selector|message|Ensure.*NEVER|Custom rule.*detect)"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for hardcoded secrets (exclude test files, config documentation, and validation patterns)
    if grep -n "sk-\|pk_\|ghp_\|gho_\|ghu_\|ghs_" "$file" 2>/dev/null | grep -v -E "(test|spec|\.eslintrc|placeholder|example|selector|queryByText|expect.*not|message)" > /dev/null; then
        echo -e "${RED}❌ CRITICAL: Found hardcoded API keys in $file${NC}"
        grep -n "sk-\|pk_\|ghp_\|gho_\|ghu_\|ghs_" "$file" | grep -v -E "(test|spec|\.eslintrc|placeholder|example|selector|queryByText|expect.*not|message)"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for database URLs with credentials (exclude test files, placeholders, and validation patterns)
    if grep -n "postgresql://\|mysql://\|mongodb://" "$file" 2>/dev/null | grep -v -E "(DATABASE_URL|process\.env|test|spec|placeholder|example|target.*value|fireEvent)" > /dev/null; then
        echo -e "${RED}❌ CRITICAL: Found hardcoded database credentials in $file${NC}"
        grep -n "postgresql://\|mysql://\|mongodb://" "$file" | grep -v -E "(DATABASE_URL|process\.env|test|spec|placeholder|example|target.*value|fireEvent)"
        ERRORS=$((ERRORS + 1))
    fi
    
    # Check for JWT secrets
    if grep -n "jwt.*secret\|JWT_SECRET" "$file" 2>/dev/null | grep -v "process.env" > /dev/null; then
        echo -e "${RED}❌ CRITICAL: Found hardcoded JWT secrets in $file${NC}"
        grep -n "jwt.*secret\|JWT_SECRET" "$file" | grep -v "process.env"
        ERRORS=$((ERRORS + 1))
    fi
}

# Function to check secure patterns
check_secure_patterns() {
    local context=$1
    shift
    local files=("$@")
    
    echo ""
    echo "🔐 Checking secure patterns in $context..."
    
    # Check if security utilities exist
    if [ -f "src/lib/security/encryption.ts" ]; then
        echo -e "${GREEN}✅ Encryption utilities found${NC}"
    else
        echo -e "${YELLOW}⚠️  WARNING: Encryption utilities not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if [ -f "src/lib/admin/settings.ts" ]; then
        echo -e "${GREEN}✅ Secure settings manager found${NC}"
    else
        echo -e "${YELLOW}⚠️  WARNING: Secure settings manager not found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    # Check if .env files are properly ignored
    if grep -q "^\.env" .gitignore 2>/dev/null; then
        echo -e "${GREEN}✅ Environment files are gitignored${NC}"
    else
        echo -e "${RED}❌ CRITICAL: .env files are not in .gitignore${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# Function to check GitHub workflows
check_github_workflows() {
    echo ""
    echo "🔐 Checking GitHub workflows for security..."
    
    if [ -d ".github/workflows" ]; then
        for workflow in .github/workflows/*.yml .github/workflows/*.yaml; do
            if [ -f "$workflow" ]; then
                check_forbidden_patterns "$workflow" "GitHub Workflow"
                
                # Check for proper secret usage
                if grep -q "\${{ secrets\." "$workflow" 2>/dev/null; then
                    echo -e "${GREEN}✅ Workflow uses GitHub secrets properly${NC}"
                fi
            fi
        done
    else
        echo -e "${YELLOW}⚠️  WARNING: No GitHub workflows found${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

# Main validation process
echo ""
echo "1️⃣  Checking source code..."
echo "================================"

# Find all TypeScript/JavaScript files (excluding node_modules, dist, and test files)
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" ! -path "*/.next/*" | while read -r file; do
    check_forbidden_patterns "$file" "Source"
done

echo ""
echo "2️⃣  Checking API routes..."
echo "================================"

# Check API routes specifically
if [ -d "src/app/api" ]; then
    find src/app/api -type f \( -name "*.ts" -o -name "*.tsx" \) | while read -r file; do
        echo "🔍 Checking API route: $file"
        
        # Check if API routes use secure settings manager
        if grep -q "settingsManager" "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ Uses secure settings manager${NC}"
        elif grep -q "localStorage\|sessionStorage" "$file" 2>/dev/null; then
            echo -e "${RED}❌ CRITICAL: API route should not use browser storage${NC}"
            ERRORS=$((ERRORS + 1))
        fi
    done
fi

echo ""
echo "3️⃣  Checking secure patterns..."
echo "================================"
check_secure_patterns "Template"

echo ""
echo "4️⃣  Checking GitHub workflows..."
echo "================================"
check_github_workflows

echo ""
echo "5️⃣  Checking environment configuration..."
echo "================================"

# Check for .env.example
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✅ .env.example exists${NC}"
    
    # Check that .env.example doesn't contain real secrets
    if grep -q "sk-\|pk_\|ghp_\|gho_\|ghu_\|ghs_" ".env.example" 2>/dev/null; then
        echo -e "${RED}❌ CRITICAL: .env.example contains real secrets${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ .env.example is safe${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  WARNING: .env.example not found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for committed .env files
for env_file in .env .env.local .env.production; do
    if [ -f "$env_file" ]; then
        echo -e "${RED}❌ CRITICAL: $env_file is committed to the repository${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Summary
echo ""
echo "======================================"
echo "📊 Security Validation Summary"
echo "======================================"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    echo "Your application follows secure patterns for secrets management."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Validation completed with $WARNINGS warnings${NC}"
    echo "Consider addressing the warnings to improve security."
    exit 0
else
    echo -e "${RED}❌ Validation failed with $ERRORS critical errors and $WARNINGS warnings${NC}"
    echo ""
    echo "🔧 Required Actions:"
    echo "1. Never store secrets in localStorage/sessionStorage"
    echo "2. Use the secure settings manager for all sensitive data"
    echo "3. Store all secrets in environment variables"
    echo "4. Ensure all .env files are in .gitignore"
    echo "5. Never commit API keys or secrets to the repository"
    echo ""
    echo "For more information, see: https://github.com/vbonk/saas-ecosystem-architecture/blob/main/SECURITY.md"
    exit 1
fi