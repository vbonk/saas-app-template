# API Documentation

## Authentication
JWT-based authentication via Clerk

## Error Handling
Standardized error responses with proper HTTP status codes

## Rate Limiting
Rate limiting implemented per endpoint

## API Endpoints

### POST /api/ai/chat
Request validation schema

**Methods:** `POST`

### POST /api/ai/generate
Check authentication

**Methods:** `POST`

### POST /api/ai/saas
Check authentication

**Methods:** `POST`

### POST /api/ai/workflows
Check authentication

**Methods:** `POST`

### POST /api/automation/flowise/chat
Check authentication

**Methods:** `POST`

### GET, POST /api/automation/flowise
Check authentication

**Methods:** `GET, POST`

### GET /api/automation/health
Check authentication

**Methods:** `GET`

### POST /api/automation/n8n/execute
Check authentication

**Methods:** `POST`

### GET, POST /api/automation/n8n
Check authentication

**Methods:** `GET, POST`

### GET, POST /api/automation/n8n/workflows
Check authentication

**Methods:** `GET, POST`

### GET /api/health
Basic health check response

**Methods:** `GET`

### GET /api/queue/status
Mock queue health for template

**Methods:** `GET`

---
*Last updated: 2025-09-19 | Auto-generated from route analysis*