'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Workflow, Activity, PlayCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AutomationHealth {
  flowise: boolean;
  n8n: boolean;
  errors: string[];
}

interface FlowiseFlow {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface N8nWorkflow {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AutomationDashboard() {
  const [health, setHealth] = useState<AutomationHealth | null>(null);
  const [flowiseFlows, setFlowiseFlows] = useState<FlowiseFlow[]>([]);
  const [n8nWorkflows, setN8nWorkflows] = useState<N8nWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAutomationData();
  }, []);

  const fetchAutomationData = async () => {
    try {
      setLoading(true);
      
      // Fetch health status
      const healthResponse = await fetch('/api/automation/health');
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealth(healthData.data.health);
      }

      // Fetch Flowise flows
      try {
        const flowiseResponse = await fetch('/api/automation/flowise');
        if (flowiseResponse.ok) {
          const flowiseData = await flowiseResponse.json();
          setFlowiseFlows(flowiseData.data || []);
        }
      } catch (error) {
        console.log('Flowise not available');
      }

      // Fetch n8n workflows
      try {
        const n8nResponse = await fetch('/api/automation/n8n/workflows');
        if (n8nResponse.ok) {
          const n8nData = await n8nResponse.json();
          setN8nWorkflows(n8nData.data || []);
        }
      } catch (error) {
        console.log('n8n not available');
      }
    } catch (error) {
      console.error('Failed to fetch automation data:', error);
      toast.error('Failed to load automation data');
    } finally {
      setLoading(false);
    }
  };

  const executeN8nWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch('/api/automation/n8n/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Workflow executed successfully');
      } else {
        toast.error(`Workflow execution failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to execute workflow:', error);
      toast.error('Failed to execute workflow');
    }
  };

  const sendFlowiseMessage = async (message: string) => {
    try {
      const response = await fetch('/api/automation/flowise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Message sent to Flowise');
        return data.data;
      } else {
        toast.error(`Flowise error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to send message to Flowise:', error);
      toast.error('Failed to send message to Flowise');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Automation Services Health
          </CardTitle>
          <CardDescription>
            Status of Flowise and n8n automation services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span>Flowise:</span>
              <Badge variant={health?.flowise ? 'default' : 'destructive'}>
                {health?.flowise ? 'Healthy' : 'Unavailable'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              <span>n8n:</span>
              <Badge variant={health?.n8n ? 'default' : 'destructive'}>
                {health?.n8n ? 'Healthy' : 'Unavailable'}
              </Badge>
            </div>
          </div>
          {health?.errors && health.errors.length > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Service Errors:</span>
              </div>
              <ul className="text-sm space-y-1">
                {health.errors.map((error, index) => (
                  <li key={index} className="text-destructive">
                    • {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services */}
      <Tabs defaultValue="flowise" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flowise" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Flowise AI Flows
          </TabsTrigger>
          <TabsTrigger value="n8n" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            n8n Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flowise" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flowise AI Chatflows</CardTitle>
              <CardDescription>
                Manage and interact with your AI chatflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!health?.flowise ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Flowise service is not available</p>
                  <p className="text-sm">Configure FLOWISE_BASE_URL in your environment</p>
                </div>
              ) : flowiseFlows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No chatflows found</p>
                  <p className="text-sm">Create chatflows in your Flowise instance</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {flowiseFlows.map((flow) => (
                    <div
                      key={flow.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{flow.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {flow.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(flow.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => sendFlowiseMessage('Hello from the template!')}
                        size="sm"
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Test Flow
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="n8n" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>n8n Workflows</CardTitle>
              <CardDescription>
                Manage and execute your automation workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!health?.n8n ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>n8n service is not available</p>
                  <p className="text-sm">Configure N8N_BASE_URL in your environment</p>
                </div>
              ) : n8nWorkflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Workflow className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No workflows found</p>
                  <p className="text-sm">Create workflows in your n8n instance</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {n8nWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{workflow.name}</h4>
                          <Badge variant={workflow.active ? 'default' : 'secondary'}>
                            {workflow.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(workflow.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => executeN8nWorkflow(workflow.id)}
                        size="sm"
                        disabled={!workflow.active}
                      >
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Execute
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}