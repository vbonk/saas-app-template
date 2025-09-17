# API Documentation

This document provides comprehensive documentation for all API endpoints in the SaaS application.

## 📋 API Overview

All API endpoints follow RESTful conventions and return JSON responses. Authentication is required for most endpoints using JWT tokens provided by Clerk.

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Response Format
All responses follow a consistent format:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2025-01-16T10:00:00Z"
}
```

### Error Handling
Error responses include detailed error information:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {}
  },
  "timestamp": "2025-01-16T10:00:00Z"
}
```

## 🔐 Authentication Endpoints

### GET /api/auth/session
Get current user session information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "user"
    },
    "session": {
      "id": "sess_456",
      "expiresAt": "2025-01-17T10:00:00Z"
    }
  }
}
```

## 👤 User Management

### GET /api/users/profile
Get current user profile.

**Authentication:** Required
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### PUT /api/users/profile
Update user profile.

**Authentication:** Required
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe"
}
```

## 💳 Billing & Subscriptions

### GET /api/billing/subscription
Get current subscription status.

**Authentication:** Required
**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_123",
    "status": "active",
    "plan": "pro",
    "currentPeriodEnd": "2025-02-16T00:00:00Z",
    "cancelAtPeriodEnd": false
  }
}
```

### POST /api/billing/create-checkout-session
Create Stripe checkout session for subscription.

**Authentication:** Required
**Request Body:**
```json
{
  "priceId": "price_123",
  "successUrl": "https://your-domain.com/success",
  "cancelUrl": "https://your-domain.com/cancel"
}
```

### POST /api/billing/create-portal-session
Create Stripe customer portal session.

**Authentication:** Required
**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/session/..."
  }
}
```

## 📊 Analytics & Monitoring

### GET /api/analytics/usage
Get user usage analytics.

**Authentication:** Required
**Response:**
```json
{
  "success": true,
  "data": {
    "requests": 1500,
    "usage": {
      "current": 75,
      "limit": 100
    },
    "period": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-01-31T23:59:59Z"
    }
  }
}
```

## 🔧 System Endpoints

### GET /api/health
Health check endpoint for monitoring.

**Authentication:** Not required
**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-16T10:00:00Z",
    "version": "1.0.0",
    "uptime": 86400
  }
}
```

## 📝 Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authenticated requests:** 1000 requests per hour
- **Unauthenticated requests:** 100 requests per hour
- **Billing endpoints:** 10 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642348800
```

## 🔒 Security

- All API endpoints use HTTPS in production
- Input validation using Zod schemas
- SQL injection prevention with Prisma ORM
- CORS configuration for allowed origins
- Request size limits and timeout protection

## 📋 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📊 OpenAPI Specification

For a complete machine-readable API specification:
- **JSON Format:** [openapi.json](openapi.json)
- **YAML Format:** [openapi.yaml](openapi.yaml)

Use these files with tools like:
- **Postman** - Import collection from OpenAPI spec
- **Swagger UI** - Interactive API documentation
- **Insomnia** - API testing and development

## 🧪 Testing the API

### Using curl
```bash
# Health check
curl http://localhost:3000/api/health

# Authenticated request (replace with actual JWT)
curl -H "Authorization: Bearer your-jwt-token" \
     http://localhost:3000/api/users/profile
```

### Using the Development Console
Access the interactive API documentation at:
- Development: http://localhost:3000/api/docs (if implemented)
- Swagger UI with OpenAPI spec

---
*Last updated: 2025-09-16 | Auto-generated from route analysis*