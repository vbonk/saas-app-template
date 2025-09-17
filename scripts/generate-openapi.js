#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class OpenAPIGenerator {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJson = this.loadPackageJson();
    this.openApiSpec = {
      openapi: '3.0.3',
      info: {
        title: this.packageJson.name || 'SaaS API',
        description: this.packageJson.description || 'SaaS application API',
        version: this.packageJson.version || '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: 'http://localhost:3000/api',
          description: 'Development server'
        },
        {
          url: 'https://your-domain.railway.app/api',
          description: 'Production server'
        }
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        },
        schemas: this.generateSchemas(),
        responses: this.generateResponses()
      },
      security: [
        {
          BearerAuth: []
        }
      ],
      paths: {}
    };
  }

  loadPackageJson() {
    try {
      return require(path.join(this.projectRoot, 'package.json'));
    } catch (error) {
      return {
        name: 'saas-api',
        description: 'SaaS application API',
        version: '1.0.0'
      };
    }
  }

  generateSchemas() {
    return {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'user_123'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          firstName: {
            type: 'string',
            example: 'John'
          },
          lastName: {
            type: 'string',
            example: 'Doe'
          },
          role: {
            type: 'string',
            enum: ['user', 'admin'],
            example: 'user'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-16T10:00:00Z'
          }
        },
        required: ['id', 'email', 'role']
      },
      Subscription: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'sub_123'
          },
          status: {
            type: 'string',
            enum: ['active', 'inactive', 'canceled', 'past_due'],
            example: 'active'
          },
          plan: {
            type: 'string',
            example: 'pro'
          },
          currentPeriodEnd: {
            type: 'string',
            format: 'date-time',
            example: '2025-02-16T00:00:00Z'
          },
          cancelAtPeriodEnd: {
            type: 'boolean',
            example: false
          }
        }
      },
      Usage: {
        type: 'object',
        properties: {
          requests: {
            type: 'integer',
            example: 1500
          },
          usage: {
            type: 'object',
            properties: {
              current: {
                type: 'integer',
                example: 75
              },
              limit: {
                type: 'integer',
                example: 100
              }
            }
          },
          period: {
            type: 'object',
            properties: {
              start: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-01T00:00:00Z'
              },
              end: {
                type: 'string',
                format: 'date-time',
                example: '2025-01-31T23:59:59Z'
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                example: 'VALIDATION_ERROR'
              },
              message: {
                type: 'string',
                example: 'Invalid input data'
              },
              details: {
                type: 'object'
              }
            }
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-16T10:00:00Z'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          data: {
            type: 'object'
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-16T10:00:00Z'
          }
        }
      }
    };
  }

  generateResponses() {
    return {
      Success: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Success'
            }
          }
        }
      },
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      TooManyRequests: {
        description: 'Too many requests',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      },
      InternalServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            }
          }
        }
      }
    };
  }

  generatePaths() {
    return {
      '/auth/session': {
        get: {
          tags: ['Authentication'],
          summary: 'Get current session',
          description: 'Retrieve current user session information',
          responses: {
            '200': {
              description: 'Session information',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              user: { $ref: '#/components/schemas/User' },
                              session: {
                                type: 'object',
                                properties: {
                                  id: { type: 'string' },
                                  expiresAt: { type: 'string', format: 'date-time' }
                                }
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/users/profile': {
        get: {
          tags: ['Users'],
          summary: 'Get user profile',
          description: 'Retrieve current user profile information',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'User profile',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/User' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        },
        put: {
          tags: ['Users'],
          summary: 'Update user profile',
          description: 'Update current user profile information',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Profile updated',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/User' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/billing/subscription': {
        get: {
          tags: ['Billing'],
          summary: 'Get subscription',
          description: 'Retrieve current subscription status',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Subscription information',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Subscription' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/billing/create-checkout-session': {
        post: {
          tags: ['Billing'],
          summary: 'Create checkout session',
          description: 'Create Stripe checkout session for subscription',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    priceId: { type: 'string' },
                    successUrl: { type: 'string', format: 'uri' },
                    cancelUrl: { type: 'string', format: 'uri' }
                  },
                  required: ['priceId', 'successUrl', 'cancelUrl']
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Checkout session created',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              url: { type: 'string', format: 'uri' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/analytics/usage': {
        get: {
          tags: ['Analytics'],
          summary: 'Get usage analytics',
          description: 'Retrieve user usage analytics and limits',
          security: [{ BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Usage analytics',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      {
                        properties: {
                          data: { $ref: '#/components/schemas/Usage' }
                        }
                      }
                    ]
                  }
                }
              }
            },
            '401': { $ref: '#/components/responses/Unauthorized' }
          }
        }
      },
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Health check',
          description: 'System health check endpoint',
          security: [],
          responses: {
            '200': {
              description: 'System health status',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Success' },
                      {
                        properties: {
                          data: {
                            type: 'object',
                            properties: {
                              status: { type: 'string', example: 'healthy' },
                              timestamp: { type: 'string', format: 'date-time' },
                              version: { type: 'string' },
                              uptime: { type: 'integer' }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        }
      }
    };
  }

  async generateOpenAPI() {
    console.log('📋 Generating OpenAPI specification...');
    
    // Add paths to spec
    this.openApiSpec.paths = this.generatePaths();
    
    // Write OpenAPI spec file
    const specPath = path.join(this.projectRoot, 'docs/openapi.json');
    this.writeFile(specPath, JSON.stringify(this.openApiSpec, null, 2));
    
    // Generate OpenAPI YAML
    const yamlContent = this.jsonToYaml(this.openApiSpec);
    const yamlPath = path.join(this.projectRoot, 'docs/openapi.yaml');
    this.writeFile(yamlPath, yamlContent);
    
    console.log('✅ OpenAPI specification generated');
    console.log(`📄 JSON: ${specPath}`);
    console.log(`📄 YAML: ${yamlPath}`);
  }

  writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
  }

  jsonToYaml(obj, indent = 0) {
    const spaces = '  '.repeat(indent);
    let yaml = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        yaml += this.jsonToYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        yaml += `${spaces}${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            yaml += `${spaces}  -\n`;
            yaml += this.jsonToYaml(item, indent + 2);
          } else {
            yaml += `${spaces}  - ${item}\n`;
          }
        });
      } else {
        const valueStr = typeof value === 'string' && value.includes('\n') 
          ? `|\n${value.split('\n').map(line => `${spaces}  ${line}`).join('\n')}`
          : value;
        yaml += `${spaces}${key}: ${valueStr}\n`;
      }
    }
    
    return yaml;
  }
}

// CLI interface
async function main() {
  const generator = new OpenAPIGenerator();
  await generator.generateOpenAPI();
}

if (require.main === module) {
  main();
}

module.exports = OpenAPIGenerator;