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
      name, 
      description, 
      features = [],
      provider = 'openai'
    } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // Create AI service with API keys from environment
    const aiService = await createAIService({
      openai: process.env.OPENAI_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY,
    });

    const saasSpec = await aiService.generateSaaSApplication(
      name,
      description,
      features,
      provider
    );

    return NextResponse.json({
      success: true,
      data: {
        name,
        description,
        features,
        provider,
        specification: saasSpec,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('AI SaaS generation error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}