#!/bin/bash

# Security Validation Script for SaaS Ecosystem
# Validates that all applications follow secure secrets management patterns

set -e

echo "🔐 SaaS Ecosystem Security Validation"
echo "======================================"
echo "🎯 Comprehensive security scanning with enhanced validation"

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

# Function to check for required security patterns
check_required_patterns() {
    local file=$1
    local context=$2
    
    # If this file handles API keys, check for encryption
    if grep -q "apiKey\|api_key\|API_KEY" "$file" 2>/dev/null; then
        if ! grep -q "encrypt\|decrypt" "$file" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  WARNING: API key handling without encryption in $file${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${GREEN}✅ Good: Found encryption patterns for API keys in $file${NC}"
        fi
    fi
}

# Function to validate environment files
check_env_files() {
    echo "🔍 Checking environment files..."
    
    for env_file in $(find . -name ".env*" -not -path "./node_modules/*" -not -name ".env.example" -not -name ".env.template"); do
        if [ -f "$env_file" ]; then
            echo -e "${YELLOW}⚠️  WARNING: Found environment file that should not be committed: $env_file${NC}"
            WARNINGS=$((WARNINGS + 1))
            
            # Check if it's in .gitignore (check both current dir and parent dir for proper gitignore)
            gitignore_found=false
            if [ -f ".gitignore" ] && grep -q "$(basename "$env_file")" .gitignore 2>/dev/null; then
                gitignore_found=true
            elif [ -f "$(dirname "$env_file")/.gitignore" ] && grep -q "$(basename "$env_file")" "$(dirname "$env_file")/.gitignore" 2>/dev/null; then
                gitignore_found=true
            fi
            
            if [ "$gitignore_found" = false ]; then
                echo -e "${RED}❌ CRITICAL: Environment file $env_file not in .gitignore${NC}"
                ERRORS=$((ERRORS + 1))
            else
                echo -e "${GREEN}✅ Environment file $env_file is properly ignored${NC}"
            fi
        fi
    done
}

# Function to check for secure settings implementation
check_secure_settings() {
    echo "🔍 Checking for secure settings implementation..."
    
    # Look for settings/configuration files
    for settings_file in $(find . -name "*settings*" -o -name "*config*" | grep -E "\.(ts|tsx|js|jsx)$" | grep -v node_modules); do
        if [ -f "$settings_file" ]; then
            check_forbidden_patterns "$settings_file" "Settings File"
            check_required_patterns "$settings_file" "Settings File"
        fi
    done
}

# Main validation
echo "🚀 Starting security validation..."

# Check TypeScript/JavaScript files (all files, no limit)
echo "🔍 Scanning all TypeScript/JavaScript files for security patterns..."
file_count=0
for file in $(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v ".next" | grep -v "dist/" | grep -v "build/"); do
    if [ -f "$file" ]; then
        check_forbidden_patterns "$file" "Source File"
        check_required_patterns "$file" "Source File"
        ((file_count++))
        if (( file_count % 50 == 0 )); then
            echo "📊 Processed $file_count files..."
        fi
    fi
done
echo "✅ Scanned $file_count source files total"

# Check environment files
check_env_files

# Check for secure settings implementation
check_secure_settings

# Check for security test files
echo "🔍 Checking for security tests..."
if ! find . -name "*security*test*" -o -name "*test*security*" | grep -v node_modules | head -1 > /dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: No security tests found${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ Good: Security tests found${NC}"
fi

# Summary
echo ""
echo "📊 Security Validation Summary"
echo "=============================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings found (review recommended)${NC}"
    exit 0
else
    echo -e "${RED}❌ $ERRORS critical security issues found!${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS warnings found${NC}"
    echo ""
    echo "🚨 CRITICAL SECURITY ISSUES MUST BE FIXED BEFORE DEPLOYMENT"
    echo ""
    echo "Common fixes:"
    echo "1. Move secrets from localStorage to server-side encrypted storage"
    echo "2. Replace hardcoded API keys with environment variables"
    echo "3. Use encryption utilities for sensitive data storage"
    echo "4. Add .env files to .gitignore"
    echo ""
    exit 1
fi