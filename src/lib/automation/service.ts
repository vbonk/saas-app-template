/**
 * Automation Service
 * Handles integration with Flowise AI and n8n workflow automation
 */

export interface FlowiseConfig {
  baseUrl: string;
  apiKey?: string;
  chatflowId?: string;
}

export interface N8nConfig {
  baseUrl: string;
  apiKey?: string;
  webhookUrl?: string;
}

export interface AutomationConfig {
  flowise?: FlowiseConfig;
  n8n?: N8nConfig;
}

export interface FlowiseFlow {
  id: string;
  name: string;
  description: string;
  chatflowConfig: any;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

export interface N8nWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  connections: any;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationTrigger {
  type: 'webhook' | 'schedule' | 'manual' | 'event';
  config: any;
}

export interface AutomationResult {
  success: boolean;
  data?: any;
  error?: string;
  executionId?: string;
  timestamp: string;
}

export class FlowiseService {
  private config: FlowiseConfig;

  constructor(config: FlowiseConfig) {
    this.config = config;
  }

  /**
   * Send message to Flowise chatflow
   */
  async sendMessage(message: string, options: {
    sessionId?: string;
    overrideConfig?: any;
    chatId?: string;
  } = {}): Promise<any> {
    if (!this.config.chatflowId) {
      throw new Error('Flowise chatflow ID not configured');
    }

    const url = `${this.config.baseUrl}/api/v1/prediction/${this.config.chatflowId}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        question: message,
        history: [],
        overrideConfig: options.overrideConfig || {},
        socketIOClientId: options.sessionId,
        chatId: options.chatId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Get available chatflows
   */
  async getChatflows(): Promise<FlowiseFlow[]> {
    const url = `${this.config.baseUrl}/api/v1/chatflows`;
    
    const response = await fetch(url, {
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Create a new chatflow
   */
  async createChatflow(flow: Partial<FlowiseFlow>): Promise<FlowiseFlow> {
    const url = `${this.config.baseUrl}/api/v1/chatflows`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify(flow),
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update a chatflow
   */
  async updateChatflow(id: string, flow: Partial<FlowiseFlow>): Promise<FlowiseFlow> {
    const url = `${this.config.baseUrl}/api/v1/chatflows/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify(flow),
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete a chatflow
   */
  async deleteChatflow(id: string): Promise<void> {
    const url = `${this.config.baseUrl}/api/v1/chatflows/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.statusText}`);
    }
  }
}

export class N8nService {
  private config: N8nConfig;

  constructor(config: N8nConfig) {
    this.config = config;
  }

  /**
   * Get all workflows
   */
  async getWorkflows(): Promise<N8nWorkflow[]> {
    const url = `${this.config.baseUrl}/api/v1/workflows`;
    
    const response = await fetch(url, {
      headers: {
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const url = `${this.config.baseUrl}/api/v1/workflows`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
      body: JSON.stringify(workflow),
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update a workflow
   */
  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    const url = `${this.config.baseUrl}/api/v1/workflows/${id}`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
      body: JSON.stringify(workflow),
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Activate/deactivate a workflow
   */
  async setWorkflowActive(id: string, active: boolean): Promise<N8nWorkflow> {
    const url = `${this.config.baseUrl}/api/v1/workflows/${id}/${active ? 'activate' : 'deactivate'}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute a workflow manually
   */
  async executeWorkflow(id: string, data?: any): Promise<AutomationResult> {
    const url = `${this.config.baseUrl}/api/v1/workflows/${id}/execute`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      success: result.data?.finished === true,
      data: result.data,
      executionId: result.data?.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get execution history
   */
  async getExecutions(workflowId?: string): Promise<any[]> {
    const url = workflowId 
      ? `${this.config.baseUrl}/api/v1/executions?filter={"workflowId":"${workflowId}"}`
      : `${this.config.baseUrl}/api/v1/executions`;
    
    const response = await fetch(url, {
      headers: {
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    const url = `${this.config.baseUrl}/api/v1/workflows/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        ...(this.config.apiKey && { 'X-N8N-API-KEY': this.config.apiKey }),
      },
    });

    if (!response.ok) {
      throw new Error(`n8n API error: ${response.statusText}`);
    }
  }
}

export class AutomationService {
  private flowise?: FlowiseService;
  private n8n?: N8nService;

  constructor(config: AutomationConfig) {
    if (config.flowise) {
      this.flowise = new FlowiseService(config.flowise);
    }

    if (config.n8n) {
      this.n8n = new N8nService(config.n8n);
    }
  }

  /**
   * Get Flowise service instance
   */
  getFlowiseService(): FlowiseService | null {
    return this.flowise || null;
  }

  /**
   * Get n8n service instance
   */
  getN8nService(): N8nService | null {
    return this.n8n || null;
  }

  /**
   * Check if services are available
   */
  getAvailableServices(): { flowise: boolean; n8n: boolean } {
    return {
      flowise: !!this.flowise,
      n8n: !!this.n8n,
    };
  }

  /**
   * Execute an automation workflow
   */
  async executeAutomation(
    type: 'flowise' | 'n8n',
    action: string,
    params: any = {}
  ): Promise<AutomationResult> {
    try {
      let result: any;

      if (type === 'flowise' && this.flowise) {
        switch (action) {
          case 'sendMessage':
            result = await this.flowise.sendMessage(params.message, params.options);
            break;
          case 'getChatflows':
            result = await this.flowise.getChatflows();
            break;
          default:
            throw new Error(`Unknown Flowise action: ${action}`);
        }
      } else if (type === 'n8n' && this.n8n) {
        switch (action) {
          case 'executeWorkflow':
            return await this.n8n.executeWorkflow(params.workflowId, params.data);
          case 'getWorkflows':
            result = await this.n8n.getWorkflows();
            break;
          case 'getExecutions':
            result = await this.n8n.getExecutions(params.workflowId);
            break;
          default:
            throw new Error(`Unknown n8n action: ${action}`);
        }
      } else {
        throw new Error(`Service ${type} not available or not configured`);
      }

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Health check for automation services
   */
  async healthCheck(): Promise<{ flowise: boolean; n8n: boolean; errors: string[] }> {
    const errors: string[] = [];
    let flowiseHealthy = false;
    let n8nHealthy = false;

    // Check Flowise
    if (this.flowise) {
      try {
        await this.flowise.getChatflows();
        flowiseHealthy = true;
      } catch (error) {
        errors.push(`Flowise health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Check n8n
    if (this.n8n) {
      try {
        await this.n8n.getWorkflows();
        n8nHealthy = true;
      } catch (error) {
        errors.push(`n8n health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      flowise: flowiseHealthy,
      n8n: n8nHealthy,
      errors,
    };
  }
}

/**
 * Create automation service from environment variables
 */
export function createAutomationService(): AutomationService {
  const config: AutomationConfig = {};

  // Flowise configuration
  if (process.env.FLOWISE_BASE_URL) {
    config.flowise = {
      baseUrl: process.env.FLOWISE_BASE_URL,
      apiKey: process.env.FLOWISE_API_KEY,
      chatflowId: process.env.FLOWISE_CHATFLOW_ID,
    };
  }

  // n8n configuration
  if (process.env.N8N_BASE_URL) {
    config.n8n = {
      baseUrl: process.env.N8N_BASE_URL,
      apiKey: process.env.N8N_API_KEY,
      webhookUrl: process.env.N8N_WEBHOOK_URL,
    };
  }

  return new AutomationService(config);
}