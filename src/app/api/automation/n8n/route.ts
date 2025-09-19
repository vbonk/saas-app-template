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
    const n8nService = automationService.getN8nService();

    if (!n8nService) {
      return NextResponse.json(
        { error: 'n8n service not configured' },
        { status: 503 }
      );
    }

    // Get all workflows
    const workflows = await n8nService.getWorkflows();

    return NextResponse.json({
      success: true,
      data: workflows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('n8n API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, params = {} } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    const automationService = createAutomationService();
    const n8nService = automationService.getN8nService();

    if (!n8nService) {
      return NextResponse.json(
        { error: 'n8n service not configured' },
        { status: 503 }
      );
    }

    const result = await automationService.executeAutomation('n8n', action, params);

    return NextResponse.json(result);
  } catch (error) {
    console.error('n8n API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}