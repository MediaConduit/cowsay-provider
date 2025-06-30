import { MediaProvider, MediaCapability, ProviderType, ProviderModel, ProviderConfig } from './types';
import { CowsayDockerModel } from './CowsayDockerModel';

export class CowsayDockerProvider implements MediaProvider {
  readonly id: string = 'cowsay-docker-provider';
  readonly name: string = 'Cowsay Docker Provider';
  readonly type: ProviderType = ProviderType.LOCAL;
  readonly capabilities: MediaCapability[] = [MediaCapability.TextToText];
  readonly models: ProviderModel[] = [
    {
      id: 'cowsay-default',
      name: 'Cowsay Default',
      description: 'A simple text-to-text model that generates ASCII art of a cow saying your text.',
      capabilities: [MediaCapability.TextToText],
      parameters: {
        maxLength: 1000,
        timeout: 30000
      },
      pricing: {
        inputCost: 0,
        outputCost: 0,
        currency: 'USD'
      }
    }
  ];

  private dockerService: any;
  private config: ProviderConfig = {};

  constructor(dockerService?: any) {
    this.dockerService = dockerService || this.getDockerService();
  }

  async configure(config: ProviderConfig): Promise<void> {
    this.config = { ...this.config, ...config };
    console.log(`Configured ${this.name} with config:`, config);
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Check if Docker service is healthy
      const dockerServiceHealthy = this.dockerService && this.dockerService.isServiceHealthy ? 
        await this.dockerService.isServiceHealthy() : true;
      
      return dockerServiceHealthy;
    } catch (error) {
      console.error('Error checking cowsay provider availability:', error);
      return false;
    }
  }

  getModelsForCapability(capability: MediaCapability): ProviderModel[] {
    return this.models.filter(model => model.capabilities.includes(capability));
  }

  async getModel(modelId: string): Promise<CowsayDockerModel> {
    const modelConfig = this.models.find(m => m.id === modelId);
    if (!modelConfig) {
      throw new Error(`Model ${modelId} not found in ${this.name}`);
    }

    if (modelId === 'cowsay-default') {
      return new CowsayDockerModel(this.dockerService);
    }
    
    throw new Error(`Model ${modelId} not supported by ${this.name}`);
  }

  async getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    activeJobs: number;
    queuedJobs: number;
    lastError?: string;
  }> {
    try {
      const isAvailable = await this.isAvailable();
      return {
        status: isAvailable ? 'healthy' : 'unhealthy',
        uptime: Date.now(), // Simplified - in real implementation would track actual uptime
        activeJobs: 0,
        queuedJobs: 0,
        lastError: isAvailable ? undefined : 'Service not available'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: 0,
        activeJobs: 0,
        queuedJobs: 0,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Legacy methods for backward compatibility
  getAvailableModels(): string[] {
    return this.models.map(m => m.id);
  }

  async createModel(modelId: string): Promise<CowsayDockerModel> {
    return this.getModel(modelId);
  }

  protected getServiceUrl(): string | undefined {
    return process.env.COWSAY_SERVICE_URL || 'https://github.com/MediaConduit/cowsay-service';
  }

  protected getDefaultBaseUrl(): string {
    return 'http://localhost:80/';
  }

  protected getDockerService(): any {
    // Mock docker service - in real implementation this would be injected
    return {
      isServiceHealthy: () => Promise.resolve(true)
    };
  }
}
