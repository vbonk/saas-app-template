import { NextRequest, NextResponse } from 'next/server';
import { createAutomationService } from '@/lib/automation/service';
import { auth } from '@clerk/nextjs';

export async function GET() {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const automationService = createAutomationService();
    const healthStatus = await automationService.healthCheck();
    const availableServices = automationService.getAvailableServices();

    return NextResponse.json({
      success: true,
      data: {
        services: availableServices,
        health: healthStatus,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Automation health check error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}