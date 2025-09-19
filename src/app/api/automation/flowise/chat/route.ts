import { NextRequest, NextResponse } from 'next/server';
import { createAutomationService } from '@/lib/automation/service';
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message, sessionId, overrideConfig } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const automationService = createAutomationService();
    const flowiseService = automationService.getFlowiseService();

    if (!flowiseService) {
      return NextResponse.json(
        { error: 'Flowise service not configured' },
        { status: 503 }
      );
    }

    const result = await flowiseService.sendMessage(message, {
      sessionId: sessionId || `user-${userId}`,
      overrideConfig,
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Flowise chat error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}