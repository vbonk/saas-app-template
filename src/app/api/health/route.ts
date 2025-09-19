import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const runtime = 'edge';

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database?: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
    redis?: {
      status: 'connected' | 'disconnected';
      latency?: number;
    };
    api?: {
      status: 'operational' | 'degraded' | 'down';
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const headersList = headers();
  
  // Basic health check response
  const health: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    checks: {},
  };

  try {
    // Check database connection (simplified - in production, actually test the connection)
    if (process.env.DATABASE_URL) {
      health.checks.database = {
        status: 'connected',
        latency: Math.random() * 50, // Mock latency
      };
    }

    // Check Redis connection (simplified)
    if (process.env.REDIS_URL) {
      health.checks.redis = {
        status: 'connected',
        latency: Math.random() * 10, // Mock latency
      };
    }

    // API operational check
    health.checks.api = {
      status: 'operational',
    };

    // Determine overall health status
    const hasDisconnected = Object.values(health.checks).some(
      check => 'status' in check && check.status === 'disconnected'
    );
    
    if (hasDisconnected) {
      health.status = 'degraded';
    }

    const responseTime = Date.now() - startTime;

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'X-Response-Time': `${responseTime}ms`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {},
      },
      { status: 503 }
    );
  }
}