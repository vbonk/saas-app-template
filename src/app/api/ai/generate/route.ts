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
      type, 
      specification, 
      provider = 'openai',
      options = {} 
    } = body;

    if (!type || !specification) {
      return NextResponse.json(
        { error: 'Type and specification are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['component', 'api', 'schema', 'config', 'content', 'automation'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create AI service with API keys from environment
    const aiService = await createAIService({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
    });

    const result = await aiService.generateCode(type, specification, provider);

    return NextResponse.json({
      success: true,
      data: {
        type,
        provider,
        result,
        specification,
        options,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}