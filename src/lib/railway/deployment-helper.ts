/**
 * Railway Deployment Helper
 * 
 * Simplified Railway deployment utilities for the SaaS template.
 * For full deployment automation, see the Admin App in the architecture repository.
 */

export interface RailwayConfig {
  projectId?: string;
  environment?: string;
  domain?: string;
}

export interface DeploymentStatus {
  status: 'pending' | 'building' | 'deploying' | 'active' | 'failed';
  url?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Railway deployment configuration helper
 */
export class RailwayDeploymentHelper {
  /**
   * Get Railway configuration from environment
   */
  static getRailwayConfig(): RailwayConfig {
    return {
      projectId: process.env.RAILWAY_PROJECT_ID,
      environment: process.env.RAILWAY_ENVIRONMENT || 'production',
      domain: process.env.RAILWAY_PUBLIC_DOMAIN,
    };
  }

  /**
   * Check if running on Railway
   */
  static isRailwayEnvironment(): boolean {
    return !!process.env.RAILWAY_ENVIRONMENT;
  }

  /**
   * Get Railway deployment URL
   */
  static getDeploymentUrl(): string | undefined {
    if (process.env.RAILWAY_PUBLIC_DOMAIN) {
      return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
    }
    return undefined;
  }

  /**
   * Format environment variables for Railway
   */
  static formatEnvironmentVariables(vars: Record<string, string>): string {
    return Object.entries(vars)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }

  /**
   * Generate Railway deployment instructions
   */
  static getDeploymentInstructions(): string[] {
    return [
      '1. Install Railway CLI: npm install -g @railway/cli',
      '2. Login to Railway: railway login',
      '3. Initialize project: railway init',
      '4. Add environment variables: railway variables set KEY=value',
      '5. Deploy: railway up',
      '6. Generate domain: railway domain',
    ];
  }

  /**
   * Get health check configuration
   */
  static getHealthCheckConfig() {
    return {
      path: '/api/health',
      timeout: 300,
      interval: 30,
      retries: 3,
    };
  }

  /**
   * Validate deployment configuration
   */
  static validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required environment variables
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get deployment metadata
   */
  static getDeploymentMetadata() {
    return {
      deployedAt: new Date().toISOString(),
      environment: process.env.RAILWAY_ENVIRONMENT || 'local',
      projectId: process.env.RAILWAY_PROJECT_ID || 'unknown',
      region: process.env.RAILWAY_REGION || 'us-west1',
      gitCommit: process.env.RAILWAY_GIT_COMMIT_SHA || 'unknown',
      gitBranch: process.env.RAILWAY_GIT_BRANCH || 'unknown',
    };
  }
}

/**
 * Railway deployment script generator
 */
export function generateDeploymentScript(appName: string, envVars: Record<string, string>): string {
  const script = `#!/bin/bash
# Railway deployment script for ${appName}
# Generated on ${new Date().toISOString()}

set -e

echo "🚂 Deploying ${appName} to Railway..."

# Check Railway CLI installation
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check authentication
railway whoami || {
    echo "❌ Not authenticated. Please run: railway login"
    exit 1
}

# Initialize project
echo "📦 Initializing Railway project..."
railway init --name "${appName}"

# Set environment variables
echo "🔧 Setting environment variables..."
${Object.entries(envVars)
  .map(([key, value]) => `railway variables set ${key}="${value}"`)
  .join('\n')}

# Deploy application
echo "🚀 Deploying application..."
railway up

# Generate domain
echo "🌐 Generating Railway domain..."
railway domain

echo "✅ Deployment complete!"
`;

  return script;
}

/**
 * Generate docker-compose for local Railway-like environment
 */
export function generateDockerCompose(appName: string): string {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@postgres:5432/${appName}
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=${appName}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
`;
}