# ARCHITECTURE_SYNC_TOKEN Setup Guide

*Created: 2025-09-18*

## 🎯 Purpose

Configure the required `ARCHITECTURE_SYNC_TOKEN` secret to enable template→architecture synchronization.

## 🔧 Setup Instructions

### Step 1: Generate Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Configure token:
   - **Name**: `SaaS Architecture Sync Token`
   - **Expiration**: No expiration (or 1 year)
   - **Scopes**: Select `repo` (Full control of private repositories)
4. Click "Generate token"
5. **IMPORTANT**: Copy the token immediately (it won't be shown again)

### Step 2: Add Repository Secret

1. Go to `https://github.com/vbonk/saas-app-template/settings/secrets/actions`
2. Click "New repository secret"
3. Configure secret:
   - **Name**: `ARCHITECTURE_SYNC_TOKEN`
   - **Secret**: Paste the PAT from Step 1
4. Click "Add secret"

### Step 3: Verify Setup

After adding the secret, the next push to the template repository should:
1. Trigger the sync workflow successfully
2. Clone the architecture repository
3. Apply the sentinel-based SECURITY.md merge
4. Create a PR in the architecture repository

## 🔍 Verification Commands

```bash
# Check if workflow runs successfully
gh run list --repo vbonk/saas-app-template --workflow="sync-architecture.yml" --limit 1

# Check if PR was created in architecture repo
gh pr list --repo vbonk/saas-ecosystem-architecture --label="sync"
```

## 📋 Expected Results

After secret configuration:
- ✅ Workflow runs complete successfully
- ✅ PR created in architecture repository
- ✅ Clean document structure with no duplicate headings
- ✅ Sentinel markers properly placed around template content

## 🚨 Troubleshooting

If workflow still fails after adding secret:
1. Verify token has `repo` scope
2. Check token hasn't expired
3. Ensure token has access to both repositories
4. Verify secret name is exactly `ARCHITECTURE_SYNC_TOKEN`

---

*Complete this setup to enable full automation of template→architecture synchronization.*