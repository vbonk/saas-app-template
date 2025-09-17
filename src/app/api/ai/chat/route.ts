import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { generateSimpleAIResponse } from '@/lib/ai-simple';
import { trackAnalytics } from '@/lib/queue-simple';
import { z } from 'zod';

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  stream: z.boolean().optional().default(false),
  model: z.enum(['fast', 'smart', 'cheap']).optional().default('fast'),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const { message, stream, model } = chatRequestSchema.parse(body);

    // TODO: Get workspace from user context
    const workspaceId = 'default'; // This should come from user's current workspace

    const context = {
      workspaceId,
      userId,
      type: 'chat' as const,
    };

    // Track the request
    await trackAnalytics('ai_chat_requested', userId, workspaceId, {
      model,
      messageLength: message.length,
      stream,
    });

    // Return complete response (streaming disabled for template)
    const response = await generateSimpleAIResponse(message, context);

    // Track completion
    await trackAnalytics('ai_chat_completed', userId, workspaceId, {
      model,
      tokensUsed: response.usage.totalTokens,
      cost: response.cost,
    });

    return NextResponse.json({
      response: response.text,
      usage: response.usage,
      cost: response.cost,
    });
  } catch (error) {
    console.error('AI Chat API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
