# SaaS Application Template

A comprehensive Next.js template for building SaaS applications with automated documentation generation, CI/CD pipeline, and production-ready architecture.

## 🎯 Features

### 🤖 Automated Documentation
- **Auto-generated README** from code analysis
- **Architecture documentation** with C4 diagrams
- **API documentation** extracted from route files
- **Deployment guides** based on configuration
- **Living documentation** that updates with every commit

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

### Repository Structure

```
saas-app-template/
├── .github/                    # GitHub workflows and templates
│   ├── workflows/             # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   └── PULL_REQUEST_TEMPLATE/ # PR templates
├── docs/                      # Auto-generated documentation
│   ├── README.md             # Project overview
│   ├── ARCHITECTURE.md       # System architecture
│   ├── API.md               # API documentation
│   ├── DEPLOYMENT.md        # Deployment guide
│   └── diagrams/            # Architecture diagrams
├── scripts/                  # Automation scripts
│   ├── generate-docs.js     # Documentation generator
│   ├── validate-docs.js     # Documentation validator
│   └── update-architecture.js # Diagram generator
├── templates/               # Documentation templates
│   ├── README.template.md   # README template
│   └── ARCHITECTURE.template.md # Architecture template
└── src/                    # Application source code
    ├── app/               # Next.js app directory
    ├── components/        # React components
    └── lib/              # Utility libraries
```

### Technology Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes + Python/FastAPI (optional)
- **Database:** PostgreSQL + Redis
- **Authentication:** Clerk
- **Payments:** Stripe
- **Hosting:** Railway
- **Monitoring:** Sentry + PostHog
- **Email:** Resend
- **Storage:** Cloudflare R2 + UploadThing

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

### Railway Deployment

1. **Connect to Railway:**
   ```bash
   railway login
   railway link
   ```

2. **Set environment variables:**
   ```bash
   railway env set DATABASE_URL="..."
   railway env set CLERK_SECRET_KEY="..."
   # ... other variables
   ```

3. **Deploy:**
   ```bash
   railway deploy
   ```

### Automated Deployment

The template includes GitHub Actions for automated deployment:

- **Staging:** Deploys on push to `develop` branch
- **Production:** Deploys on push to `main` branch
- **Quality Gates:** All tests and documentation validation must pass

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

## 📈 Roadmap

### Current Features ✅
- Automated documentation generation
- Complete CI/CD pipeline
- Quality assurance framework
- Production-ready architecture

### Planned Features 🚧
- Multi-language support
- Advanced monitoring dashboards
- Performance optimization tools
- Security enhancement automation

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

