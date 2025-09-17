#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ArchitectureUpdater {
  constructor() {
    this.projectRoot = process.cwd();
    this.diagramsDir = path.join(this.projectRoot, 'docs/diagrams');
  }

  async updateArchitecture() {
    console.log('🔄 Updating architecture diagrams...');
    
    try {
      // Ensure diagrams directory exists
      if (!fs.existsSync(this.diagramsDir)) {
        fs.mkdirSync(this.diagramsDir, { recursive: true });
      }

      // Generate C4 diagrams based on code structure
      await this.generateC4Diagrams();
      
      // Create component diagrams
      await this.generateComponentDiagrams();
      
      // Generate data flow diagrams
      await this.generateDataFlowDiagrams();
      
      console.log('✅ Architecture diagrams updated successfully');
    } catch (error) {
      console.error('❌ Error updating architecture diagrams:', error.message);
      process.exit(1);
    }
  }

  async generateC4Diagrams() {
    // Generate Context Diagram
    const contextDiagram = `@startuml context-diagram
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

title System Context Diagram

Person(user, "User", "SaaS application user")
System(saas_app, "SaaS Application", "Next.js application with authentication and billing")

System_Ext(clerk, "Clerk", "Authentication service")
System_Ext(stripe, "Stripe", "Payment processing")
System_Ext(railway, "Railway", "Hosting platform")
System_Ext(sentry, "Sentry", "Error monitoring")
System_Ext(posthog, "PostHog", "Analytics")

Rel(user, saas_app, "Uses", "HTTPS")
Rel(saas_app, clerk, "Authenticates users", "API")
Rel(saas_app, stripe, "Processes payments", "API") 
Rel(saas_app, railway, "Deployed on", "Platform")
Rel(saas_app, sentry, "Reports errors", "API")
Rel(saas_app, posthog, "Sends analytics", "API")

@enduml`;

    this.writeFile('docs/diagrams/context-diagram.puml', contextDiagram);

    // Generate Container Diagram
    const containerDiagram = `@startuml container-diagram
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title Container Diagram

Person(user, "User", "SaaS application user")

System_Boundary(saas_system, "SaaS Application") {
  Container(web_app, "Web Application", "Next.js", "Delivers static content and hosts React app")
  Container(api, "API Application", "Next.js API Routes", "Provides API functionality")
  ContainerDb(database, "Database", "PostgreSQL", "Stores user data, subscriptions, etc.")
  ContainerDb(cache, "Cache", "Redis", "Stores session data and cache")
}

System_Ext(clerk, "Clerk", "Authentication service")
System_Ext(stripe, "Stripe", "Payment processing")

Rel(user, web_app, "Uses", "HTTPS")
Rel(web_app, api, "Makes API calls", "JSON/HTTPS")
Rel(api, database, "Reads/Writes", "SQL")
Rel(api, cache, "Reads/Writes", "Redis Protocol")
Rel(api, clerk, "Validates tokens", "HTTPS")
Rel(api, stripe, "Processes payments", "HTTPS")

@enduml`;

    this.writeFile('docs/diagrams/container-diagram.puml', containerDiagram);

    // Generate Component Diagram
    const componentDiagram = `@startuml component-diagram
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml

title Component Diagram - API Application

Container(web_app, "Web Application", "Next.js", "Delivers static content")

Container_Boundary(api, "API Application") {
  Component(auth_controller, "Authentication Controller", "Next.js API Route", "Handles auth operations")
  Component(user_controller, "User Controller", "Next.js API Route", "Handles user operations")
  Component(billing_controller, "Billing Controller", "Next.js API Route", "Handles billing operations")
  Component(auth_service, "Authentication Service", "Service", "Validates JWT tokens")
  Component(user_service, "User Service", "Service", "Manages user data")
  Component(billing_service, "Billing Service", "Service", "Manages subscriptions")
  Component(email_service, "Email Service", "Service", "Sends notifications")
}

ContainerDb(database, "Database", "PostgreSQL")
ContainerDb(cache, "Cache", "Redis")
System_Ext(clerk, "Clerk")
System_Ext(stripe, "Stripe")

Rel(web_app, auth_controller, "API calls")
Rel(web_app, user_controller, "API calls") 
Rel(web_app, billing_controller, "API calls")

Rel(auth_controller, auth_service, "Uses")
Rel(user_controller, user_service, "Uses")
Rel(billing_controller, billing_service, "Uses")

Rel(auth_service, clerk, "Validates")
Rel(billing_service, stripe, "API calls")
Rel(user_service, database, "SQL")
Rel(auth_service, cache, "Caches")

@enduml`;

    this.writeFile('docs/diagrams/component-diagram.puml', componentDiagram);
  }

  async generateComponentDiagrams() {
    const deploymentDiagram = `@startuml deployment-diagram
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Deployment.puml

title Deployment Diagram

Deployment_Node(railway, "Railway Platform", "Cloud Platform") {
  Deployment_Node(web_server, "Web Server", "Node.js Runtime") {
    Container(app, "SaaS Application", "Next.js", "Main application")
  }
  
  Deployment_Node(db_server, "Database Server", "PostgreSQL") {
    ContainerDb(database, "Primary Database", "PostgreSQL", "User and application data")
  }
  
  Deployment_Node(cache_server, "Cache Server", "Redis") {
    ContainerDb(cache, "Session Cache", "Redis", "Session and temporary data")
  }
}

Deployment_Node(external, "External Services", "Third-party") {
  System_Ext(clerk, "Clerk", "Authentication")
  System_Ext(stripe, "Stripe", "Payments")
  System_Ext(sentry, "Sentry", "Monitoring")
}

Rel(app, database, "Connects to")
Rel(app, cache, "Connects to")
Rel(app, clerk, "API calls")
Rel(app, stripe, "API calls")
Rel(app, sentry, "Error reporting")

@enduml`;

    this.writeFile('docs/diagrams/deployment-diagram.puml', deploymentDiagram);
  }

  async generateDataFlowDiagrams() {
    const dataFlowDiagram = `@startuml data-flow
title Data Flow Diagram

actor User
participant "Web App" as Web
participant "API Routes" as API
participant "Services" as Services
database "PostgreSQL" as DB
database "Redis" as Cache
participant "Clerk" as Auth
participant "Stripe" as Payment

User -> Web: HTTP Request
Web -> API: API Call
API -> Auth: Validate Token
Auth -> API: Token Valid
API -> Services: Business Logic
Services -> DB: Query Data
DB -> Services: Return Data
Services -> Cache: Cache Result
Services -> API: Return Response
API -> Web: JSON Response
Web -> User: Render UI

note over Services, Payment: Payment Flow
User -> Web: Subscribe
Web -> API: Create Subscription
API -> Payment: Create Customer
Payment -> API: Customer Created
API -> DB: Save Subscription
DB -> API: Subscription Saved
API -> Web: Success Response
Web -> User: Redirect to Success

@enduml`;

    this.writeFile('docs/diagrams/data-flow.puml', dataFlowDiagram);
  }

  writeFile(filePath, content) {
    const fullPath = path.join(this.projectRoot, filePath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`📄 Created: ${filePath}`);
  }
}

// CLI interface
async function main() {
  const updater = new ArchitectureUpdater();
  await updater.updateArchitecture();
}

if (require.main === module) {
  main();
}

module.exports = ArchitectureUpdater;