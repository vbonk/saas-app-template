// SaaS App Template - Simple Queue System
// Mock implementation for template without Redis dependency

export interface JobTypes {
  'send-email': {
    to: string;
    subject: string;
    template: string;
    data: Record<string, unknown>;
    workspaceId: string;
  };

  'ai-generation': {
    prompt: string;
    model: 'fast' | 'smart' | 'cheap';
    workspaceId: string;
    userId?: string;
    responseWebhook?: string;
  };

  'usage-analytics': {
    event: string;
    userId: string;
    workspaceId: string;
    properties: Record<string, unknown>;
  };
}

export const JOB_PRIORITIES = {
  critical: 1,
  high: 2,
  normal: 3,
  low: 4,
} as const;

// Mock queue for template - replace with real implementation
export async function addJob<T extends keyof JobTypes>(
  queueName: string,
  jobType: T,
  data: JobTypes[T],
  options: {
    priority?: keyof typeof JOB_PRIORITIES;
    delay?: number;
  } = {}
) {
  console.log(`Mock Queue [${queueName}]: Adding job ${jobType}`, {
    data,
    options,
  });
  return { id: `mock-${Date.now()}`, data, options };
}

export async function trackAnalytics(
  event: string,
  userId: string,
  workspaceId: string,
  properties: Record<string, unknown> = {}
) {
  return addJob(
    'analytics',
    'usage-analytics',
    {
      event,
      userId,
      workspaceId,
      properties,
    },
    { priority: 'normal' }
  );
}

export async function sendEmail(
  to: string,
  subject: string,
  template: string,
  data: Record<string, unknown>,
  workspaceId: string,
  priority: keyof typeof JOB_PRIORITIES = 'normal'
) {
  return addJob(
    'email',
    'send-email',
    {
      to,
      subject,
      template,
      data,
      workspaceId,
    },
    { priority }
  );
}
