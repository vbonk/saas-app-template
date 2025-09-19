#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DocumentationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = process.cwd();
  }

  validate() {
    console.log('🔍 Validating documentation...');
    
    this.validateREADME();
    this.validateArchitecture();
    this.validateAPI();
    this.validateDeployment();
    this.validateDiagrams();
    this.validateChangelog();
    
    return {
      errors: this.errors,
      warnings: this.warnings,
      isValid: this.errors.length === 0
    };
  }

  validateREADME() {
    const readmePath = path.join(this.projectRoot, 'docs/README.md');
    
    if (!fs.existsSync(readmePath)) {
      this.errors.push('docs/README.md is missing');
      return;
    }

    const content = fs.readFileSync(readmePath, 'utf8');
    
    // Check required sections
    const requiredSections = [
      '# ', // Title
      '## 🚀 Quick Start',
      '## 🏗️ Architecture',
      '## 📖 Documentation'
    ];

    requiredSections.forEach(section => {
      if (!content.includes(section)) {
        this.errors.push(`README missing required section: ${section}`);
      }
    });

    // Check for placeholder content (exclude Railway/GitHub Actions variables)
    const templatePlaceholders = content.match(/\{\{(?!\$)[^}]+\}\}/g);
    if (templatePlaceholders && templatePlaceholders.length > 0) {
      this.errors.push('README contains unresolved template placeholders');
    }

    // Check for outdated content
    const lastUpdated = content.match(/Last updated: (\d{4}-\d{2}-\d{2})/);
    if (lastUpdated) {
      const updateDate = new Date(lastUpdated[1]);
      const daysSinceUpdate = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 30) {
        this.warnings.push('README has not been updated in over 30 days');
      }
    } else {
      this.warnings.push('README missing last updated date');
    }

    // Check for broken internal links
    const internalLinks = content.match(/\[.*?\]\((docs\/.*?)\)/g) || [];
    internalLinks.forEach(link => {
      const linkPath = link.match(/\((docs\/.*?)\)/)[1];
      const fullPath = path.join(this.projectRoot, linkPath);
      if (!fs.existsSync(fullPath)) {
        this.errors.push(`Broken internal link in README: ${linkPath}`);
      }
    });
  }

  validateArchitecture() {
    const archPath = path.join(this.projectRoot, 'docs/ARCHITECTURE.md');
    
    if (!fs.existsSync(archPath)) {
      this.warnings.push('docs/ARCHITECTURE.md is missing');
      return;
    }

    const content = fs.readFileSync(archPath, 'utf8');

    // Check for required sections
    const requiredSections = [
      '## 🏗️ System Overview',
      '### Technology Stack'
    ];

    requiredSections.forEach(section => {
      if (!content.includes(section)) {
        this.warnings.push(`ARCHITECTURE.md missing section: ${section}`);
      }
    });

    // Check for placeholder content
    const templatePlaceholders = content.match(/\{\{(?!\$)[^}]+\}\}/g);
    if (templatePlaceholders && templatePlaceholders.length > 0) {
      this.errors.push('ARCHITECTURE.md contains unresolved template placeholders');
    }

    // Check for required diagrams
    const diagramsDir = path.join(this.projectRoot, 'docs/diagrams');
    const requiredDiagrams = [
      'context-diagram.png',
      'container-diagram.png'
    ];

    if (fs.existsSync(diagramsDir)) {
      requiredDiagrams.forEach(diagram => {
        const diagramPath = path.join(diagramsDir, diagram);
        if (!fs.existsSync(diagramPath)) {
          this.warnings.push(`Missing architecture diagram: ${diagram}`);
        }
      });
    } else {
      this.warnings.push('docs/diagrams directory is missing');
    }
  }

  validateAPI() {
    const apiPath = path.join(this.projectRoot, 'docs/API.md');
    
    if (!fs.existsSync(apiPath)) {
      // Only warn if API routes exist
      const apiRoutesDir = path.join(this.projectRoot, 'src/app/api');
      if (fs.existsSync(apiRoutesDir)) {
        this.warnings.push('docs/API.md is missing but API routes exist');
      }
      return;
    }

    const content = fs.readFileSync(apiPath, 'utf8');

    // Check for placeholder content
    const templatePlaceholders = content.match(/\{\{(?!\$)[^}]+\}\}/g);
    if (templatePlaceholders && templatePlaceholders.length > 0) {
      this.errors.push('API.md contains unresolved template placeholders');
    }

    // Compare documented endpoints with actual API routes
    const documentedEndpoints = this.extractDocumentedEndpoints(content);
    const actualEndpoints = this.extractActualEndpoints();
    
    const missingDocs = actualEndpoints.filter(
      endpoint => !documentedEndpoints.some(doc => doc.path === endpoint.path)
    );
    
    if (missingDocs.length > 0) {
      this.warnings.push(`Undocumented API endpoints: ${missingDocs.map(e => e.path).join(', ')}`);
    }

    const obsoleteDocs = documentedEndpoints.filter(
      doc => !actualEndpoints.some(actual => actual.path === doc.path)
    );
    
    if (obsoleteDocs.length > 0) {
      this.warnings.push(`Documented but non-existent API endpoints: ${obsoleteDocs.map(e => e.path).join(', ')}`);
    }
  }

  validateDeployment() {
    const deployPath = path.join(this.projectRoot, 'docs/DEPLOYMENT.md');
    
    if (!fs.existsSync(deployPath)) {
      this.warnings.push('docs/DEPLOYMENT.md is missing');
      return;
    }

    const content = fs.readFileSync(deployPath, 'utf8');

    // Check for placeholder content
    const templatePlaceholders = content.match(/\{\{(?!\$)[^}]+\}\}/g);
    if (templatePlaceholders && templatePlaceholders.length > 0) {
      this.errors.push('DEPLOYMENT.md contains unresolved template placeholders');
    }

    // Check for environment variables documentation
    if (!content.includes('Environment Variables') && !content.includes('environment')) {
      this.warnings.push('DEPLOYMENT.md missing environment variables section');
    }
  }

  validateDiagrams() {
    const diagramsDir = path.join(this.projectRoot, 'docs/diagrams');
    
    if (!fs.existsSync(diagramsDir)) {
      this.warnings.push('docs/diagrams directory is missing');
      return;
    }

    const diagrams = fs.readdirSync(diagramsDir).filter(file => 
      file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.svg')
    );

    if (diagrams.length === 0) {
      this.warnings.push('No architecture diagrams found in docs/diagrams');
    }

    // Check for PlantUML source files
    const pumlFiles = fs.readdirSync(diagramsDir).filter(file => file.endsWith('.puml'));
    const imageFiles = diagrams.filter(file => file.endsWith('.png'));

    pumlFiles.forEach(pumlFile => {
      const baseName = path.basename(pumlFile, '.puml');
      const expectedImage = `${baseName}.png`;
      
      if (!imageFiles.includes(expectedImage)) {
        this.warnings.push(`PlantUML file ${pumlFile} has no corresponding PNG image`);
      }
    });
  }

  validateChangelog() {
    const changelogPath = path.join(this.projectRoot, 'CHANGELOG.md');
    
    if (!fs.existsSync(changelogPath)) {
      this.warnings.push('CHANGELOG.md is missing');
      return;
    }

    const content = fs.readFileSync(changelogPath, 'utf8');

    // Check for standard changelog format
    if (!content.includes('# Changelog') && !content.includes('# Change Log')) {
      this.warnings.push('CHANGELOG.md missing standard header');
    }

    // Check for recent entries
    const lines = content.split('\n');
    const datePattern = /\d{4}-\d{2}-\d{2}/;
    const recentDates = lines
      .filter(line => datePattern.test(line))
      .map(line => new Date(line.match(datePattern)[0]))
      .filter(date => !isNaN(date.getTime()));

    if (recentDates.length > 0) {
      const mostRecent = Math.max(...recentDates);
      const daysSinceUpdate = (Date.now() - mostRecent) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 60) {
        this.warnings.push('CHANGELOG.md has not been updated in over 60 days');
      }
    }
  }

  extractDocumentedEndpoints(content) {
    const endpoints = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/###?\s+(GET|POST|PUT|DELETE|PATCH)\s+(.+)/);
      
      if (match) {
        endpoints.push({
          method: match[1],
          path: match[2].trim(),
          description: lines[i + 1] || ''
        });
      }
    }
    
    return endpoints;
  }

  extractActualEndpoints() {
    const endpoints = [];
    const apiDir = path.join(this.projectRoot, 'src/app/api');
    
    if (!fs.existsSync(apiDir)) {
      return endpoints;
    }

    this.scanAPIRoutes(apiDir, '/api', endpoints);
    return endpoints;
  }

  scanAPIRoutes(dir, basePath, endpoints) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          this.scanAPIRoutes(itemPath, `${basePath}/${item}`, endpoints);
        } else if (item === 'route.ts' || item === 'route.js') {
          const routeInfo = this.analyzeRoute(itemPath, basePath);
          if (routeInfo) {
            routeInfo.methods.forEach(method => {
              endpoints.push({
                method,
                path: basePath,
                description: routeInfo.description
              });
            });
          }
        }
      }
    } catch (error) {
      console.warn(`Error scanning API routes in ${dir}:`, error.message);
    }
  }

  analyzeRoute(filePath, routePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const methods = [];
      
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
      return null;
    }
  }

  extractRouteDescription(content) {
    const commentMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (commentMatch) return commentMatch[1];
    
    const lineCommentMatch = content.match(/\/\/\s*(.+)/);
    if (lineCommentMatch) return lineCommentMatch[1];
    
    return 'API endpoint';
  }
}

// CLI interface
async function main() {
  const validator = new DocumentationValidator();
  const result = validator.validate();

  // Output results
  if (result.errors.length > 0) {
    console.error('\n❌ Documentation validation failed:');
    result.errors.forEach(error => console.error(`  • ${error}`));
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Documentation warnings:');
    result.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('\n✅ Documentation validation passed - no issues found!');
  } else if (result.errors.length === 0) {
    console.log('\n✅ Documentation validation passed with warnings');
  }

  // Exit with error code if validation failed
  if (result.errors.length > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DocumentationValidator;

