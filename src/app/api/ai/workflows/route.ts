import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '@/lib/ai/providers';
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      description, 
      type, 
      provider = 'openai'
    } = body;

    if (!description || !type) {
      return NextResponse.json(
        { error: 'Description and type are required' },
        { status: 400 }
      );
    }

    // Validate workflow type
    if (!['n8n', 'flowise'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "n8n" or "flowise"' },
        { status: 400 }
      );
    }

    // Create AI service with API keys from environment
    const aiService = await createAIService({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
    });

    const workflow = await aiService.generateWorkflow(description, type, provider);

    return NextResponse.json({
      success: true,
      data: {
        description,
        type,
        provider,
        workflow,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI workflow generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}