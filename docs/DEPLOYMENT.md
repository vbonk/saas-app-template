# Deployment Guide

This guide covers deploying your SaaS application to production using Railway platform.

## 🚀 Railway Deployment

Railway provides a simple, developer-friendly platform for deploying applications with automatic scaling and monitoring.

### Prerequisites

1. **Railway Account:** Sign up at [railway.app](https://railway.app)
2. **GitHub Repository:** Your code must be in a GitHub repository
3. **Environment Variables:** All required environment variables configured

### Quick Deployment

1. **Connect to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project:**
   ```bash
   railway init
   railway link
   ```

3. **Set Environment Variables:**
   ```bash
   railway env set DATABASE_URL="postgresql://..."
   railway env set CLERK_SECRET_KEY="sk_..."
   railway env set STRIPE_SECRET_KEY="sk_..."
   railway env set NEXT_PUBLIC_APP_URL="https://your-domain.railway.app"
   ```

4. **Deploy:**
   ```bash
   railway deploy
   ```

## 🔧 Environment Configuration

### Required Environment Variables

Copy from `.env.example` and configure for production:

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.railway.app

# Database (Railway provides these automatically)
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Authentication (Clerk)
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Monitoring
SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...

# File Storage
UPLOADTHING_SECRET=sk_...
UPLOADTHING_APP_ID=...

# Optional: Cloudflare R2
CLOUDFLARE_R2_ACCESS_KEY_ID=...
CLOUDFLARE_R2_SECRET_ACCESS_KEY=...
CLOUDFLARE_R2_BUCKET_NAME=...
CLOUDFLARE_R2_ENDPOINT=...

# API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Development
NEXT_TELEMETRY_DISABLED=1
```

### Database Setup

Railway automatically provisions PostgreSQL and Redis:

1. **Add Database Service:**
   - Go to Railway dashboard
   - Add PostgreSQL service
   - Add Redis service
   - Connection strings are automatically available

2. **Run Migrations:**
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma generate
   ```

## 🏗️ Build Configuration

The application uses the following build configuration:

```json
{
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "installCommand": "npm ci"
}
```

### Railway Configuration

Create `railway.toml` for deployment settings:

```toml
[build]
command = "npm run build"
watchPatterns = ["src/**"]

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on-failure"
restartPolicyMaxRetries = 10

[[services]]
name = "web"
source = "."
```

## 🔒 Production Security

### Security Headers

The application includes security middleware:

```javascript
// Security headers are automatically configured
{
  "Content-Security-Policy": "default-src 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
}
```

### SSL/TLS

Railway automatically provides:
- SSL certificates for custom domains
- HTTPS redirect enforcement
- TLS 1.2+ enforcement

## 📊 Monitoring & Analytics

### Health Checks

The application provides health check endpoints:

- `/api/health` - Application health status
- `/api/health/db` - Database connectivity
- `/api/health/redis` - Redis connectivity

### Error Monitoring

Sentry is configured for error tracking:

```javascript
// Automatic error reporting
// Performance monitoring
// Release tracking
// User feedback collection
```

### Analytics

PostHog provides:
- User behavior analytics
- Feature flag management
- A/B testing capabilities
- Custom event tracking

## 🔄 CI/CD Pipeline

### GitHub Actions

Automated deployment pipeline:

```yaml
# Triggers on push to main branch
# Runs tests and security scans
# Deploys to Railway automatically
# Updates documentation
```

### Deployment Stages

1. **Staging Environment:**
   - Triggered by pushes to `develop` branch
   - Full testing environment
   - Preview deployments

2. **Production Environment:**
   - Triggered by pushes to `main` branch
   - Production database and services
   - Custom domain configuration

## 🔧 Database Migration

### Running Migrations

```bash
# Development
npx prisma migrate dev

# Production
railway run npx prisma migrate deploy
```

### Backup Strategy

Railway provides automatic backups:
- Daily database snapshots
- Point-in-time recovery
- Cross-region replication

## 📈 Scaling Configuration

### Automatic Scaling

Railway handles scaling automatically:
- CPU and memory-based scaling
- Request-based scaling
- Regional deployments

### Performance Optimization

```bash
# Enable caching
railway env set REDIS_URL="redis://..."

# Optimize bundle size
npm run build:analyze

# Configure CDN
railway env set CDN_URL="https://..."
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures:**
   ```bash
   # Check build logs
   railway logs --service web

   # Rebuild from scratch
   railway redeploy
   ```

2. **Database Connection:**
   ```bash
   # Test database connectivity
   railway run npx prisma db ping

   # Reset database connection
   railway env set DATABASE_URL="..."
   ```

3. **Environment Variables:**
   ```bash
   # List all environment variables
   railway env

   # Check specific variable
   railway env get CLERK_SECRET_KEY
   ```

### Support Resources

- [Railway Documentation](https://docs.railway.app)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Railway Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-railway)

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate configured
- [ ] Custom domain connected
- [ ] Monitoring services configured
- [ ] Health checks passing
- [ ] Security headers enabled
- [ ] Backup strategy in place
- [ ] CI/CD pipeline working
- [ ] Performance monitoring active

---
*Last updated: 2025-09-16 | Railway deployment configuration*