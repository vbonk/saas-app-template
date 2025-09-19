import { OpenAI } from 'openai';

export interface AIProvider {
  name: string;
  generateCode: (prompt: string, options?: GenerationOptions) => Promise<string>;
  generateStructure: (prompt: string) => Promise<any>;
  generateWorkflow: (description: string, type: 'n8n' | 'flowise') => Promise<any>;
}

export interface GenerationOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async generateCode(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert full-stack developer. Generate clean, production-ready code following best practices.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options.temperature || 0.1,
      max_tokens: options.maxTokens || 4000,
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateStructure(prompt: string): Promise<any> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are a software architect. Generate detailed project structures and specifications in JSON format. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(content);
    } catch (error) {
      return {
        error: 'Invalid JSON response',
        rawResponse: content,
      };
    }
  }

  async generateWorkflow(description: string, type: 'n8n' | 'flowise'): Promise<any> {
    const systemPrompts = {
      n8n: 'You are an n8n workflow expert. Generate complete n8n workflow JSON that can be imported directly into n8n. Include all necessary nodes, connections, and configurations.',
      flowise: 'You are a Flowise AI expert. Generate complete Flowise flow JSON that can be imported directly into Flowise. Include all AI components, chains, and configurations.',
    };

    const response = await this.client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompts[type],
        },
        {
          role: 'user',
          content: `Generate a ${type} workflow for: ${description}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(content);
    } catch (error) {
      return {
        error: 'Invalid JSON response',
        rawResponse: content,
        type,
        description,
      };
    }
  }
}

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private baseUrl = 'https://api.anthropic.com/v1/messages';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCode(prompt: string, options: GenerationOptions = {}): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 4000,
        messages: [
          {
            role: 'user',
            content: `You are an expert full-stack developer. Generate clean, production-ready code following best practices.\n\n${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  async generateStructure(prompt: string): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: `You are a software architect. Generate detailed project structures and specifications in JSON format. Always respond with valid JSON.\n\n${prompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '{}';

    try {
      return JSON.parse(content);
    } catch (error) {
      return {
        error: 'Invalid JSON response',
        rawResponse: content,
      };
    }
  }

  async generateWorkflow(description: string, type: 'n8n' | 'flowise'): Promise<any> {
    const systemPrompts = {
      n8n: 'You are an n8n workflow expert. Generate complete n8n workflow JSON that can be imported directly into n8n.',
      flowise: 'You are a Flowise AI expert. Generate complete Flowise flow JSON that can be imported directly into Flowise.',
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `${systemPrompts[type]}\n\nGenerate a ${type} workflow for: ${description}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text || '{}';

    try {
      return JSON.parse(content);
    } catch (error) {
      return {
        error: 'Invalid JSON response',
        rawResponse: content,
        type,
        description,
      };
    }
  }
}

export class AIService {
  private providers: Map<string, AIProvider> = new Map();

  addProvider(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): AIProvider | null {
    return this.providers.get(name) || null;
  }

  async generateSaaSApplication(
    name: string,
    description: string,
    features: string[] = [],
    preferredProvider = 'openai'
  ) {
    const provider = this.getProvider(preferredProvider);
    if (!provider) {
      throw new Error(`AI provider ${preferredProvider} not available`);
    }

    const prompt = `Generate a complete SaaS application specification for:
    
Name: ${name}
Description: ${description}
Features: ${features.join(', ')}

Generate a comprehensive project structure including:
1. File structure with all necessary files
2. Database schema design
3. API endpoints specification  
4. Frontend component structure
5. Deployment configuration
6. Environment variables needed
7. Development setup instructions
8. Automation workflows (n8n and Flowise integration)

Respond with a detailed JSON structure that includes all of this information.`;

    return await provider.generateStructure(prompt);
  }

  async generateCode(
    type: 'component' | 'api' | 'schema' | 'config' | 'content' | 'automation',
    specification: string,
    preferredProvider = 'openai'
  ) {
    const provider = this.getProvider(preferredProvider);
    if (!provider) {
      throw new Error(`AI provider ${preferredProvider} not available`);
    }

    const typePrompts = {
      component: 'Generate a React component with TypeScript',
      api: 'Generate a Next.js API route',
      schema: 'Generate a Prisma database schema',
      config: 'Generate configuration files',
      content: 'Generate high-quality written content',
      automation: 'Generate automation workflow configuration',
    };

    const prompt = `${typePrompts[type]}:\n\n${specification}\n\nGenerate clean, production-ready code with proper error handling, TypeScript types, and documentation.`;

    return await provider.generateCode(prompt);
  }

  async generateWorkflow(
    description: string,
    type: 'n8n' | 'flowise',
    preferredProvider = 'openai'
  ) {
    const provider = this.getProvider(preferredProvider);
    if (!provider) {
      throw new Error(`AI provider ${preferredProvider} not available`);
    }

    return await provider.generateWorkflow(description, type);
  }
}

export async function createAIService(apiKeys: {
  openai?: string;
  anthropic?: string;
}): Promise<AIService> {
  const service = new AIService();

  if (apiKeys.openai) {
    service.addProvider(new OpenAIProvider(apiKeys.openai));
  }

  if (apiKeys.anthropic) {
    service.addProvider(new AnthropicProvider(apiKeys.anthropic));
  }

  return service;
}