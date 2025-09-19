# 🚀 SaaS Application Template

> **Production-Ready Template** for building enterprise-grade SaaS applications with automated documentation, comprehensive CI/CD, and battle-tested architecture patterns.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org)
[![Railway](https://img.shields.io/badge/Railway-Ready-purple)](https://railway.app)
[![Documentation](https://img.shields.io/badge/Docs-Automated-green)](docs/)
[![CI/CD](https://img.shields.io/badge/CI/CD-Active-orange)](https://github.com/vbonk/saas-app-template/actions)

## 🔗 Architecture Resources

| Resource | Description | Link |
|----------|-------------|------|
| **Architecture Repo** | Complete ecosystem architecture and patterns | [saas-ecosystem-architecture](https://github.com/vbonk/saas-ecosystem-architecture) |
| **Admin Interface** | Central management and deployment system | [Admin App](https://github.com/vbonk/saas-ecosystem-architecture/tree/main/admin-app) |
| **Documentation Hub** | Auto-generated architecture documentation | [Architecture Docs](docs/ARCHITECTURE.md) |
| **Security Guide** | Enterprise security implementation | [Security Patterns](docs/security/) |
| **AI Integration** | Flowise and n8n workflow automation | [AI Guide](docs/ai-integration.md) |

## 🎯 Features

### 🤖 Automated Documentation
- **Auto-generated README** from code analysis
- **Architecture documentation** with C4 diagrams
- **API documentation** extracted from route files
- **Deployment guides** based on configuration
- **Living documentation** that updates with every commit
- **✅ Cross-Repository Sync** - Automatically syncs security patterns to architecture repository
- **✅ Production-Ready Automation** - All workflows verified and operational (2025-09-18)

### 🏗️ Modern Tech Stack
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **Stripe** for payments
- **Railway** for hosting
- **PostgreSQL + Redis** for data

### 🔄 CI/CD Pipeline
- **GitHub Actions** for automated testing
- **Quality gates** with linting, type checking, and tests
- **Security scanning** with npm audit and Snyk
- **Performance testing** with Lighthouse CI
- **Automated deployment** to Railway

### 📊 Quality Assurance
- **Documentation validation** in CI/CD
- **Branch protection** requiring documentation updates
- **Pull request templates** with documentation checklists
- **Automated changelog** generation

## 🚀 Quick Start

### Using as Template

1. **Create new repository from template:**
   ```bash
   gh repo create my-saas-app --template vbonk/saas-app-template
   ```

2. **Clone and setup:**
   ```bash
   git clone https://github.com/yourusername/my-saas-app.git
   cd my-saas-app
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Generate initial documentation:**
   ```bash
   npm run docs:generate
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

### Automated App Creation

Use the enhanced creation script for fully automated setup:

```bash
# Download the creation script
curl -o create-app.sh https://raw.githubusercontent.com/vbonk/saas-app-template/main/scripts/create-app.sh
chmod +x create-app.sh

# Create new app with full automation
./create-app.sh "my-new-app" "mynewapp.com"
```

## 📚 Documentation System

### Automatic Generation

Documentation is automatically generated from your code:

- **README.md** - Project overview and quick start
- **ARCHITECTURE.md** - System design and components
- **API.md** - API endpoints and specifications
- **DEPLOYMENT.md** - Deployment and configuration guide

### Manual Commands

```bash
# Generate all documentation
npm run docs:generate

# Generate specific documentation
npm run docs:readme
npm run docs:architecture
npm run docs:api
npm run docs:deployment

# Validate documentation quality
npm run docs:validate
```

### CI/CD Integration

Documentation is automatically:
- ✅ **Generated** on every commit
- ✅ **Validated** in pull requests
- ✅ **Updated** when code changes
- ✅ **Required** for merges

## 🏗️ Architecture

### Production Patterns Included

This template implements enterprise-grade patterns from our [Architecture Repository](https://github.com/vbonk/saas-ecosystem-architecture):

#### 🔐 Security Patterns
- **AES-256 Encryption**: Server-side encryption for all sensitive data
- **Zero Browser Storage**: No secrets in localStorage/sessionStorage
- **Multi-Layer Validation**: Pre-commit, CI/CD, runtime security checks
- **Secure API Patterns**: Rate limiting, authentication, authorization
- **Environment Isolation**: Strict separation of dev/staging/production

#### 🏭 Production Features
- **Multi-Tenant Architecture**: Tenant isolation and data partitioning
- **Performance Monitoring**: Real-time metrics and alerts
- **Error Tracking**: Comprehensive error capture and analysis
- **Feature Flags**: Progressive rollout and A/B testing
- **Audit Logging**: Complete activity tracking

#### 🤖 AI/Automation Integration
- **Flowise Integration**: AI agent orchestration (coming soon)
- **n8n Workflows**: Business process automation (coming soon)
- **OpenAI/Claude API**: Multi-provider AI support
- **Automated Testing**: 80% coverage requirement

### Repository Structure

```
saas-app-template/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/             # CI/CD pipelines
│   │   ├── ci.yml            # Main CI/CD pipeline
│   │   ├── security.yml      # Security scanning
│   │   ├── deploy.yml        # Deployment automation
│   │   └── docs.yml          # Documentation generation
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE/ # PR templates
├── docs/                      # Auto-generated documentation
│   ├── README.md             # Project overview
│   ├── ARCHITECTURE.md       # System architecture
│   ├── API.md               # API documentation
│   ├── DEPLOYMENT.md        # Deployment guide
│   ├── security/            # Security documentation
│   └── diagrams/            # Architecture diagrams
├── scripts/                  # Automation scripts
│   ├── generate-docs.js     # Documentation generator
│   ├── validate-docs.js     # Documentation validator
│   ├── security-audit.sh    # Security validation
│   └── update-architecture.js # Diagram generator
├── templates/               # Documentation templates
│   ├── README.template.md   # README template
│   └── ARCHITECTURE.template.md # Architecture template
├── tests/                   # Test suites
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── e2e/               # End-to-end tests (Puppeteer)
│   └── security/          # Security test suite
└── src/                    # Application source code
    ├── app/               # Next.js app directory
    ├── components/        # React components
    ├── lib/              # Utility libraries
    │   ├── security/     # Security utilities
    │   └── admin/        # Admin utilities
    └── middleware/       # API middleware

```

### Technology Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + Shadcn/ui
- **Backend:** Next.js API Routes + Edge Runtime
- **Database:** PostgreSQL + Redis + Prisma ORM
- **Authentication:** Clerk (enterprise-grade)
- **Payments:** Stripe (with restricted keys)
- **Hosting:** Railway (with health checks)
- **Monitoring:** Sentry + PostHog
- **Email:** Resend
- **Storage:** Cloudflare R2 + UploadThing
- **Testing:** Jest + Playwright + Puppeteer
- **Security:** Multi-layer validation + encryption

## 🔧 Configuration

### Environment Variables

Create `.env.local` with:

```bash
# Database
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# Authentication
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."

# Payments
STRIPE_SECRET_KEY="sk_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Monitoring
SENTRY_DSN="https://..."
NEXT_PUBLIC_POSTHOG_KEY="phc_..."

# Email
RESEND_API_KEY="re_..."
```

### Stack Configuration

Create `stack.config.json`:

```json
{
  "frontend": "Next.js 15 + TypeScript + Tailwind CSS",
  "backend": "Next.js API Routes",
  "database": "PostgreSQL + Redis",
  "hosting": "Railway",
  "auth": "Clerk",
  "payments": "Stripe",
  "monitoring": "Sentry + PostHog"
}
```

## 🚀 Deployment

### Railway Deployment (One-Click)

The template includes automated Railway deployment with admin interface integration:

1. **Using Admin Interface (Recommended):**
   - Navigate to the [Admin App](https://github.com/vbonk/saas-ecosystem-architecture/tree/main/admin-app)
   - Use the one-click deployment feature
   - Automatic domain provisioning and SSL setup
   - Real-time deployment monitoring

2. **Manual Railway Deployment:**
   ```bash
   railway login
   railway link
   ```

3. **Set environment variables:**
   ```bash
   railway env set DATABASE_URL="..."
   railway env set CLERK_SECRET_KEY="..."
   # ... other variables
   ```

4. **Deploy:**
   ```bash
   railway deploy
   ```

### Automated Deployment Pipeline

The template includes enterprise-grade CI/CD:

- **Staging:** Auto-deploys on push to `develop` branch
- **Production:** Auto-deploys on push to `main` branch with approval
- **Preview:** Creates preview environments for pull requests
- **Rollback:** Automatic rollback on deployment failure
- **Monitoring:** Integrated health checks and alerts
- **Security:** Automated security scanning before deployment

### 🚂 Railway Configuration

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "services": [
    {
      "name": "web",
      "source": ".",
      "domains": ["${{RAILWAY_PUBLIC_DOMAIN}}"]
    }
  ]
}
```

## 📊 Quality Assurance

### Pre-commit Hooks

- **Linting:** ESLint with TypeScript support
- **Formatting:** Prettier for code formatting
- **Type Checking:** TypeScript strict mode
- **Documentation:** Validation before commit

### CI/CD Pipeline

- **Testing:** Jest unit tests + Playwright E2E
- **Security:** npm audit + Snyk scanning
- **Performance:** Lighthouse CI
- **Documentation:** Auto-generation and validation

### Branch Protection

- **Required checks:** All CI/CD jobs must pass
- **Documentation:** Updates required for merges
- **Reviews:** Code owner approval required

## 🤝 Contributing

### Pull Request Process

1. **Create feature branch** from `develop`
2. **Make changes** with tests and documentation
3. **Run quality checks:**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run docs:validate
   ```
4. **Submit pull request** with completed template
5. **Address review feedback**
6. **Merge** after approval and passing checks

### Documentation Requirements

- [ ] README updated if public API changed
- [ ] Architecture docs updated if design changed
- [ ] API docs updated if endpoints changed
- [ ] Deployment guide updated if infrastructure changed

## 📈 Roadmap & Sync Status

### Current Features ✅
- ✅ Automated documentation generation
- ✅ Complete CI/CD pipeline with security scanning
- ✅ Quality assurance framework (80% coverage)
- ✅ Production-ready architecture patterns
- ✅ Cross-repository synchronization
- ✅ Enterprise security implementation

### In Progress 🚧
- 🚧 Railway deployment automation (admin interface)
- 🚧 Puppeteer E2E testing framework port
- 🚧 Flowise AI agent integration
- 🚧 n8n workflow automation
- 🚧 Multi-tenant data isolation patterns
- 🚧 Advanced monitoring dashboards

### Planned Features 📋
- 📋 Multi-language support (i18n)
- 📋 Performance optimization toolkit
- 📋 A/B testing framework
- 📋 Advanced analytics integration
- 📋 Marketplace/plugin system
- 📋 Mobile app support (React Native)

### Architecture Sync Status

| Pattern | Architecture Repo | Template | Status |
|---------|------------------|----------|--------|
| Security Patterns | ✅ Complete | 🚧 Partial | In Progress |
| Railway Automation | ✅ Complete | ❌ Missing | Pending |
| Puppeteer Testing | ✅ Complete | ❌ Missing | Pending |
| AI Integration | ✅ Complete | ❌ Missing | Pending |
| Multi-tenant | ✅ Complete | 🚧 Basic | In Progress |
| Cost Analysis | ✅ Complete | ❌ Missing | Pending |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation:** Check the auto-generated docs in `/docs`
- **Issues:** Use GitHub issue templates
- **Discussions:** GitHub Discussions for questions
- **Contributing:** See CONTRIBUTING.md

---

**Built with ❤️ for the SaaS development community**

*This template provides everything you need to build, document, and deploy production-ready SaaS applications with automated quality assurance and living documentation.*

