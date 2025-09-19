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

    const workflows = await n8nService.getWorkflows();

    return NextResponse.json({
      success: true,
      data: workflows,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('n8n workflows API error:', error);
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
    const { name, description, nodes, connections, active = false } = body;

    if (!name) {
      return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 });
    }

    const automationService = createAutomationService();
    const n8nService = automationService.getN8nService();

    if (!n8nService) {
      return NextResponse.json(
        { error: 'n8n service not configured' },
        { status: 503 }
      );
    }

    const workflow = await n8nService.createWorkflow({
      name,
      description,
      nodes: nodes || [],
      connections: connections || {},
      active,
    });

    return NextResponse.json({
      success: true,
      data: workflow,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('n8n create workflow error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}