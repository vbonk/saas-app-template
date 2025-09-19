'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Code, Zap, Bot, Sparkles, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

type GenerationType = 'component' | 'api' | 'schema' | 'config' | 'content' | 'automation';
type WorkflowType = 'n8n' | 'flowise';
type ProviderType = 'openai' | 'anthropic';

interface GenerationResult {
  type: GenerationType;
  provider: ProviderType;
  result: string;
  specification: string;
}

interface WorkflowResult {
  description: string;
  type: WorkflowType;
  provider: ProviderType;
  workflow: any;
}

interface SaaSResult {
  name: string;
  description: string;
  features: string[];
  provider: ProviderType;
  specification: any;
}

export function AIGenerator() {
  const [loading, setLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(null);
  const [saasResult, setSaasResult] = useState<SaaSResult | null>(null);

  // Code Generation
  const [codeType, setCodeType] = useState<GenerationType>('component');
  const [codeSpecification, setCodeSpecification] = useState('');
  const [codeProvider, setCodeProvider] = useState<ProviderType>('openai');

  // Workflow Generation
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowType, setWorkflowType] = useState<WorkflowType>('n8n');
  const [workflowProvider, setWorkflowProvider] = useState<ProviderType>('openai');

  // SaaS Generation
  const [saasName, setSaasName] = useState('');
  const [saasDescription, setSaasDescription] = useState('');
  const [saasFeatures, setSaasFeatures] = useState('');
  const [saasProvider, setSaasProvider] = useState<ProviderType>('openai');

  const generateCode = async () => {
    if (!codeSpecification.trim()) {
      toast.error('Please enter a specification');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: codeType,
          specification: codeSpecification,
          provider: codeProvider,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setGenerationResult(data.data);
        toast.success('Code generated successfully');
      } else {
        toast.error(`Generation failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
      toast.error('Failed to generate code');
    } finally {
      setLoading(false);
    }
  };

  const generateWorkflow = async () => {
    if (!workflowDescription.trim()) {
      toast.error('Please enter a workflow description');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: workflowDescription,
          type: workflowType,
          provider: workflowProvider,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setWorkflowResult(data.data);
        toast.success('Workflow generated successfully');
      } else {
        toast.error(`Workflow generation failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to generate workflow:', error);
      toast.error('Failed to generate workflow');
    } finally {
      setLoading(false);
    }
  };

  const generateSaaS = async () => {
    if (!saasName.trim() || !saasDescription.trim()) {
      toast.error('Please enter a name and description');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/ai/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saasName,
          description: saasDescription,
          features: saasFeatures.split(',').map(f => f.trim()).filter(f => f),
          provider: saasProvider,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSaasResult(data.data);
        toast.success('SaaS specification generated successfully');
      } else {
        toast.error(`SaaS generation failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to generate SaaS:', error);
      toast.error('Failed to generate SaaS');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadAsFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Powered Generation
          </CardTitle>
          <CardDescription>
            Generate code, workflows, and complete SaaS specifications using AI
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="code" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Code Generation
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Workflow Generation
          </TabsTrigger>
          <TabsTrigger value="saas" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            SaaS Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Code</CardTitle>
                <CardDescription>
                  Generate components, APIs, schemas, and more
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code-type">Type</Label>
                  <Select value={codeType} onValueChange={(value: GenerationType) => setCodeType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="component">React Component</SelectItem>
                      <SelectItem value="api">API Route</SelectItem>
                      <SelectItem value="schema">Database Schema</SelectItem>
                      <SelectItem value="config">Configuration</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="automation">Automation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code-provider">AI Provider</Label>
                  <Select value={codeProvider} onValueChange={(value: ProviderType) => setCodeProvider(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code-specification">Specification</Label>
                  <Textarea
                    id="code-specification"
                    placeholder="Describe what you want to generate..."
                    value={codeSpecification}
                    onChange={(e) => setCodeSpecification(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={generateCode} 
                  disabled={loading || !codeSpecification.trim()}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Code'}
                </Button>
              </CardContent>
            </Card>

            {generationResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Code
                    <div className="flex gap-2">
                      <Badge variant="outline">{generationResult.type}</Badge>
                      <Badge variant="outline">{generationResult.provider}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(generationResult.result)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadAsFile(generationResult.result, `generated-${generationResult.type}.txt`)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-96">
                        <code>{generationResult.result}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate Workflow</CardTitle>
                <CardDescription>
                  Generate n8n or Flowise workflow configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workflow-type">Workflow Type</Label>
                  <Select value={workflowType} onValueChange={(value: WorkflowType) => setWorkflowType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="n8n">n8n Workflow</SelectItem>
                      <SelectItem value="flowise">Flowise AI Flow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflow-provider">AI Provider</Label>
                  <Select value={workflowProvider} onValueChange={(value: ProviderType) => setWorkflowProvider(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="workflow-description">Description</Label>
                  <Textarea
                    id="workflow-description"
                    placeholder="Describe the workflow you want to create..."
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={generateWorkflow} 
                  disabled={loading || !workflowDescription.trim()}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate Workflow'}
                </Button>
              </CardContent>
            </Card>

            {workflowResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated Workflow
                    <div className="flex gap-2">
                      <Badge variant="outline">{workflowResult.type}</Badge>
                      <Badge variant="outline">{workflowResult.provider}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(workflowResult.workflow, null, 2))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy JSON
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadAsFile(
                          JSON.stringify(workflowResult.workflow, null, 2),
                          `${workflowResult.type}-workflow.json`
                        )}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-96">
                        <code>{JSON.stringify(workflowResult.workflow, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="saas" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generate SaaS Application</CardTitle>
                <CardDescription>
                  Generate complete SaaS application specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="saas-name">Application Name</Label>
                  <Input
                    id="saas-name"
                    placeholder="My SaaS App"
                    value={saasName}
                    onChange={(e) => setSaasName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saas-description">Description</Label>
                  <Textarea
                    id="saas-description"
                    placeholder="Describe your SaaS application..."
                    value={saasDescription}
                    onChange={(e) => setSaasDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saas-features">Features (comma-separated)</Label>
                  <Input
                    id="saas-features"
                    placeholder="user auth, dashboards, analytics, payments"
                    value={saasFeatures}
                    onChange={(e) => setSaasFeatures(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saas-provider">AI Provider</Label>
                  <Select value={saasProvider} onValueChange={(value: ProviderType) => setSaasProvider(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={generateSaaS} 
                  disabled={loading || !saasName.trim() || !saasDescription.trim()}
                  className="w-full"
                >
                  {loading ? 'Generating...' : 'Generate SaaS Spec'}
                </Button>
              </CardContent>
            </Card>

            {saasResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Generated SaaS Specification
                    <Badge variant="outline">{saasResult.provider}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(saasResult.specification, null, 2))}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy JSON
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadAsFile(
                          JSON.stringify(saasResult.specification, null, 2),
                          `${saasResult.name.toLowerCase().replace(/\s+/g, '-')}-spec.json`
                        )}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm overflow-auto max-h-96">
                        <code>{JSON.stringify(saasResult.specification, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}