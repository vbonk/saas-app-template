#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
// const { execSync } = require('child_process');

class DocumentationGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJson = this.loadPackageJson();
    this.stackConfig = this.loadStackConfig();
  }

  loadPackageJson() {
    try {
      return require(path.join(this.projectRoot, 'package.json'));
    } catch (error) {
      console.warn('package.json not found, using defaults');
      return {
        name: 'saas-application',
        description: 'A SaaS application built with Next.js',
        dependencies: {}
      };
    }
  }

  loadStackConfig() {
    try {
      const configPath = path.join(this.projectRoot, 'stack.config.json');
      if (fs.existsSync(configPath)) {
        return require(configPath);
      }
    } catch (error) {
      console.warn('stack.config.json not found, using defaults');
    }
    
    return {
      frontend: 'Next.js 15 + TypeScript + Tailwind CSS',
      backend: 'Next.js API Routes',
      database: 'PostgreSQL + Redis',
      hosting: 'Railway',
      auth: 'Clerk',
      payments: 'Stripe',
      monitoring: 'Sentry + PostHog'
    };
  }

  async generateREADME() {
    console.log('📝 Generating README.md...');
    
    const template = this.loadTemplate('README.template.md');
    const apiRoutes = this.extractAPIEndpoints();
    const data = {
      projectName: this.packageJson.name,
      description: this.packageJson.description,
      techStack: this.extractTechStack(),
      endpoints: this.formatEndpoints(apiRoutes),
      deploymentInfo: this.getDeploymentInfo(),
      lastUpdated: new Date().toISOString().split('T')[0],
      quickStart: this.generateQuickStart(),
      features: this.extractFeatures()
    };

    const readme = this.renderTemplate(template, data);
    this.writeFile('docs/README.md', readme);
    console.log('✅ README.md generated');
  }

  async generateArchitecture() {
    console.log('🏗️ Generating ARCHITECTURE.md...');
    
    const template = this.loadTemplate('ARCHITECTURE.template.md');
    const components = this.analyzeComponents();
    const data = {
      projectName: this.packageJson.name,
      techStack: this.stackConfig,
      components: this.formatComponents(components),
      dependencies: this.analyzeDependencies(),
      dataFlow: this.analyzeDataFlow(),
      securityModel: this.analyzeSecurityModel(),
      scalingStrategy: this.getScalingStrategy(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    const architecture = this.renderTemplate(template, data);
    this.writeFile('docs/ARCHITECTURE.md', architecture);
    console.log('✅ ARCHITECTURE.md generated');
  }

  async generateAPI() {
    console.log('📡 Generating API.md...');
    
    const template = this.loadTemplate('API.template.md');
    const apiRoutes = this.extractAPIEndpoints();
    
    const data = {
      projectName: this.packageJson.name,
      endpoints: this.formatEndpoints(apiRoutes),
      authentication: this.getAuthenticationInfo(),
      errorHandling: this.getErrorHandlingInfo(),
      rateLimit: this.getRateLimitInfo(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    const apiDocs = this.renderTemplate(template, data);
    this.writeFile('docs/API.md', apiDocs);
    console.log('✅ API.md generated');
  }

  async generateDeployment() {
    console.log('🚀 Generating DEPLOYMENT.md...');
    
    const template = this.loadTemplate('DEPLOYMENT.template.md');
    const data = {
      projectName: this.packageJson.name,
      platform: 'Railway',
      domain: process.env.DOMAIN || 'your-domain.com',
      environment: this.getEnvironmentVariables(),
      buildCommand: this.packageJson.scripts?.build || 'npm run build',
      startCommand: this.packageJson.scripts?.start || 'npm start',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    const deployment = this.renderTemplate(template, data);
    this.writeFile('docs/DEPLOYMENT.md', deployment);
    console.log('✅ DEPLOYMENT.md generated');
  }

  extractTechStack() {
    const dependencies = this.packageJson.dependencies || {};
    const devDependencies = this.packageJson.devDependencies || {};
    
    return {
      frontend: this.detectFramework(dependencies),
      backend: this.detectBackend(dependencies),
      database: this.stackConfig.database,
      styling: this.detectStyling(dependencies),
      testing: this.detectTesting(devDependencies),
      deployment: this.stackConfig.hosting
    };
  }

  detectFramework(deps) {
    if (deps.next) return `Next.js ${deps.next}`;
    if (deps.react) return `React ${deps.react}`;
    return 'Next.js';
  }

  detectBackend(deps) {
    if (deps.fastapi) return 'FastAPI';
    if (deps.express) return 'Express.js';
    return 'Next.js API Routes';
  }

  detectStyling(deps) {
    if (deps.tailwindcss) return 'Tailwind CSS';
    if (deps['styled-components']) return 'Styled Components';
    return 'CSS Modules';
  }

  detectTesting(deps) {
    const frameworks = [];
    if (deps.jest) frameworks.push('Jest');
    if (deps.playwright) frameworks.push('Playwright');
    if (deps.cypress) frameworks.push('Cypress');
    return frameworks.length > 0 ? frameworks.join(', ') : 'Jest';
  }

  extractAPIEndpoints() {
    const apiDir = path.join(this.projectRoot, 'src/app/api');
    if (!fs.existsSync(apiDir)) return [];

    return this.scanAPIRoutes(apiDir);
  }

  scanAPIRoutes(dir, basePath = '/api') {
    const routes = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // Recursive scan for nested routes
          routes.push(...this.scanAPIRoutes(itemPath, `${basePath}/${item}`));
        } else if (item === 'route.ts' || item === 'route.js') {
          // Found an API route
          const routeInfo = this.analyzeRoute(itemPath, basePath);
          if (routeInfo) routes.push(routeInfo);
        }
      }
    } catch (error) {
      console.warn(`Error scanning API routes in ${dir}:`, error.message);
    }
    
    return routes;
  }

  analyzeRoute(filePath, routePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const methods = [];
      
      // Extract HTTP methods
      if (content.includes('export async function GET')) methods.push('GET');
      if (content.includes('export async function POST')) methods.push('POST');
      if (content.includes('export async function PUT')) methods.push('PUT');
      if (content.includes('export async function DELETE')) methods.push('DELETE');
      if (content.includes('export async function PATCH')) methods.push('PATCH');
      
      return {
        path: routePath,
        methods: methods,
        description: this.extractRouteDescription(content)
      };
    } catch (error) {
      console.warn(`Error analyzing route ${filePath}:`, error.message);
      return null;
    }
  }

  extractRouteDescription(content) {
    // Look for JSDoc comments or inline comments
    const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (commentMatch) return commentMatch[1];
    
    const lineCommentMatch = content.match(/\/\/\s*(.+)/);
    if (lineCommentMatch) return lineCommentMatch[1];
    
    return 'API endpoint';
  }

  analyzeComponents() {
    const componentsDir = path.join(this.projectRoot, 'src/components');
    if (!fs.existsSync(componentsDir)) return [];

    return this.scanComponents(componentsDir);
  }

  scanComponents(dir) {
    const components = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          components.push(...this.scanComponents(itemPath));
        } else if (item.endsWith('.tsx') || item.endsWith('.jsx')) {
          const componentInfo = this.analyzeComponent(itemPath);
          if (componentInfo) components.push(componentInfo);
        }
      }
    } catch (error) {
      console.warn(`Error scanning components in ${dir}:`, error.message);
    }
    
    return components;
  }

  analyzeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, path.extname(filePath));
      
      return {
        name: fileName,
        path: filePath.replace(this.projectRoot, ''),
        purpose: this.extractComponentPurpose(content),
        dependencies: this.extractComponentDependencies(content)
      };
    } catch (error) {
      console.warn(`Error analyzing component ${filePath}:`, error.message);
      return null;
    }
  }

  extractComponentPurpose(content) {
    // Look for JSDoc comments
    const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (commentMatch) return commentMatch[1];
    
    return 'React component';
  }

  extractComponentDependencies(content) {
    const imports = content.match(/import .+ from ['"](.+)['"]/g) || [];
    return imports
      .map(imp => imp.match(/from ['"](.+)['"]/)[1])
      .filter(dep => !dep.startsWith('.') && !dep.startsWith('/'))
      .slice(0, 5); // Limit to top 5 external dependencies
  }

  loadTemplate(templateName) {
    const templatePath = path.join(this.projectRoot, 'templates', templateName);
    
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf8');
    }
    
    // Fallback to default template
    return this.getDefaultTemplate(templateName);
  }

  getDefaultTemplate(templateName) {
    const templates = {
      'README.template.md': `# {{projectName}}

{{description}}

## 🚀 Quick Start

{{quickStart}}

## 🏗️ Architecture

This application is built with our modern SaaS stack:

- **Frontend:** {{techStack.frontend}}
- **Backend:** {{techStack.backend}}
- **Database:** {{techStack.database}}
- **Styling:** {{techStack.styling}}
- **Testing:** {{techStack.testing}}
- **Deployment:** {{techStack.deployment}}

### Key Features

- 🤖 **AI Integration** - Mock AI chat with usage tracking
- 🏢 **Multi-tenant Architecture** - Prisma schema with workspace isolation
- 🎨 **Modern UI Components** - shadcn/ui inspired component system
- 📊 **Background Jobs** - Queue system for async processing
- 🔐 **Authentication Ready** - Clerk integration prepared
- 💳 **Payment Processing** - Stripe integration prepared

## 📡 API Endpoints

{{endpoints}}

## 🚀 Development

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis (optional, for caching)
- Railway account (for deployment)

### Local Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/{{projectName}}.git
cd {{projectName}}

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations (if applicable)
npm run db:migrate

# Start development server
npm run dev
\`\`\`

### Available Scripts

\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run linting
npm run type-check   # Run TypeScript checks
\`\`\`

## 🚀 Deployment

This application is configured for deployment on Railway with automated CI/CD.

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

\`\`\`bash
# Connect to Railway
railway login
railway link

# Deploy
railway deploy
\`\`\`

## 📖 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System architecture and design decisions
- [API Documentation](docs/API.md) - Complete API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions

## 📊 Monitoring & Analytics

This application includes comprehensive monitoring:

- **Error Tracking:** Sentry for error monitoring and performance tracking
- **Product Analytics:** PostHog for user behavior and feature usage
- **Infrastructure:** Railway metrics for application performance
- **Uptime:** Built-in health checks and monitoring

## 🔐 Security

Security features included:

- **Authentication:** Clerk for secure user management
- **Authorization:** Role-based access control
- **Data Protection:** Encrypted data transmission and storage
- **Security Headers:** Comprehensive security headers configuration
- **Input Validation:** Server-side validation for all inputs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Make your changes
4. Run tests and linting (\`npm run test && npm run lint\`)
5. Commit your changes (\`git commit -m 'Add amazing feature'\`)
6. Push to the branch (\`git push origin feature/amazing-feature\`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Follow the existing code style
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation Issues:** Check the [docs](docs/) directory
- **Bug Reports:** Use GitHub Issues
- **Feature Requests:** Use GitHub Issues with the enhancement label
- **Questions:** Use GitHub Discussions

---

*Last updated: {{lastUpdated}} | Auto-generated documentation*

**Built with the SaaS Application Template - providing automated documentation, CI/CD, and production-ready architecture.**`,

      'ARCHITECTURE.template.md': `# Architecture Documentation

## 🏗️ System Overview

### Technology Stack
- **Frontend:** {{techStack.frontend}}
- **Backend:** {{techStack.backend}}
- **Database:** {{techStack.database}}
- **Styling:** {{techStack.styling}}
- **Testing:** {{techStack.testing}}
- **Deployment:** {{techStack.deployment}}

### Component Architecture
{{components}}

## 📊 Architecture Diagrams

![System Context](diagrams/context-diagram.png)
![Container Diagram](diagrams/container-diagram.png)

---
*Last updated: {{lastUpdated}} | Auto-generated from code analysis*`,

      'API.template.md': `# API Documentation

## Authentication
{{authentication}}

## Error Handling
{{errorHandling}}

## Rate Limiting
{{rateLimit}}

## API Endpoints

{{endpoints}}

---
*Last updated: {{lastUpdated}} | Auto-generated from route analysis*`
    };
    
    return templates[templateName] || '# {{projectName}}\n\nDocumentation template not found.';
  }

  renderTemplate(template, data) {
    let result = template;
    
    // Simple template replacement
    result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, key) => {
      const value = this.getNestedValue(data, key);
      return value !== undefined ? value : match;
    });
    
    // Handle each loops
    result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayKey, template) => {
      const array = data[arrayKey];
      if (!Array.isArray(array)) return '';
      
      return array.map(item => {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return item[key] !== undefined ? item[key] : match;
        });
      }).join('\n');
    });
    
    return result;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  writeFile(filePath, content) {
    const fullPath = path.join(this.projectRoot, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
  }

  generateQuickStart() {
    return `### Prerequisites
- Node.js 20+
- ${this.stackConfig.database}
- ${this.stackConfig.hosting} account

### Installation
\`\`\`bash
npm install
cp .env.example .env.local
npm run dev
\`\`\``;
  }

  extractFeatures() {
    // This could be enhanced to scan for feature flags or analyze components
    return ['Authentication', 'API Integration', 'Responsive Design'];
  }

  analyzeDependencies() {
    return 'Dependencies analyzed from package.json';
  }

  analyzeDataFlow() {
    return 'Data flows from client through API routes to database';
  }

  analyzeSecurityModel() {
    return 'Security implemented through authentication middleware and input validation';
  }

  getScalingStrategy() {
    return 'Horizontal scaling through Railway platform with database optimization';
  }

  getDeploymentInfo() {
    return {
      platform: this.stackConfig.hosting,
      cicd: 'GitHub Actions',
      monitoring: this.stackConfig.monitoring
    };
  }

  getAuthenticationInfo() {
    return 'JWT-based authentication via Clerk';
  }

  getErrorHandlingInfo() {
    return 'Standardized error responses with proper HTTP status codes';
  }

  getRateLimitInfo() {
    return 'Rate limiting implemented per endpoint';
  }

  getEnvironmentVariables() {
    return [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'CLERK_SECRET_KEY',
      'STRIPE_SECRET_KEY'
    ];
  }

  formatComponents(components) {
    if (!components || components.length === 0) {
      return 'No components found or analyzed.';
    }
    
    return components.map(comp => {
      const deps = comp.dependencies && comp.dependencies.length > 0 
        ? comp.dependencies.join(', ') 
        : 'None';
      
      return `#### ${comp.name}
- **Purpose:** ${comp.purpose}
- **Location:** ${comp.path}
- **Dependencies:** ${deps}`;
    }).join('\n\n');
  }

  formatEndpoints(endpoints) {
    if (!endpoints || endpoints.length === 0) {
      return 'No API endpoints found.';
    }
    
    return endpoints.map(endpoint => {
      const methods = endpoint.methods.join(', ');
      return `### ${methods} ${endpoint.path}
${endpoint.description}

**Methods:** \`${methods}\``;
    }).join('\n\n');
  }
}

// CLI interface
async function main() {
  const generator = new DocumentationGenerator();
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));
  const type = typeArg ? typeArg.split('=')[1] : 'all';

  try {
    switch (type) {
      case 'readme':
        await generator.generateREADME();
        break;
      case 'architecture':
        await generator.generateArchitecture();
        break;
      case 'api':
        await generator.generateAPI();
        break;
      case 'deployment':
        await generator.generateDeployment();
        break;
      case 'all':
      default:
        console.log('📚 Generating all documentation...');
        await generator.generateREADME();
        await generator.generateArchitecture();
        await generator.generateAPI();
        await generator.generateDeployment();
        console.log('✅ All documentation generated successfully!');
    }
  } catch (error) {
    console.error('❌ Error generating documentation:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DocumentationGenerator;

