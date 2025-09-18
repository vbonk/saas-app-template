import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Mock queue health for template
async function getQueueHealth() {
  return {
    email: { waiting: 0, active: 0, completed: 5, failed: 0, healthy: true },
    ai: { waiting: 1, active: 2, completed: 12, failed: 0, healthy: true },
    analytics: {
      waiting: 0,
      active: 0,
      completed: 25,
      failed: 1,
      healthy: true,
    },
    general: { waiting: 0, active: 0, completed: 3, failed: 0, healthy: true },
  };
}

export async function GET() {
  try {
    // Authenticate user (optional - might want admin-only access)
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get queue health status
    const health = await getQueueHealth();

    // Calculate overall health
    const totalFailed = Object.values(health).reduce(
      (sum: number, queue) => sum + queue.failed,
      0
    );
    const totalActive = Object.values(health).reduce(
      (sum: number, queue) => sum + queue.active,
      0
    );
    const totalWaiting = Object.values(health).reduce(
      (sum: number, queue) => sum + queue.waiting,
      0
    );

    const overallHealth = {
      status:
        totalFailed > 50
          ? 'unhealthy'
          : totalFailed > 10
            ? 'warning'
            : 'healthy',
      totalQueues: Object.keys(health).length,
      totalActive,
      totalWaiting,
      totalFailed,
      lastChecked: new Date().toISOString(),
    };

    return NextResponse.json({
      overall: overallHealth,
      queues: health,
    });
  } catch (error) {
    console.error('Queue Status API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}
