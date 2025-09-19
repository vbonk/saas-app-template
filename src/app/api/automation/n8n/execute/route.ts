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
    const { workflowId, data } = body;

    if (!workflowId) {
      return NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 });
    }

    const automationService = createAutomationService();
    const n8nService = automationService.getN8nService();

    if (!n8nService) {
      return NextResponse.json(
        { error: 'n8n service not configured' },
        { status: 503 }
      );
    }

    const result = await n8nService.executeWorkflow(workflowId, data);

    return NextResponse.json({
      success: result.success,
      data: result.data,
      executionId: result.executionId,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('n8n execute workflow error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}