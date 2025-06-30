import { MediaCapability, ProviderType, ProviderModel } from './types';
import { CowsayDockerModel } from './CowsayDockerModel';

// Import DockerMediaProvider from the main MediaConduit system
// This will be resolved when the provider is loaded dynamically
export class CowsayDockerProvider {
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

  constructor(dockerService: any) {
    this.dockerService = dockerService;
    console.log(`🐄 CowsayDockerProvider initialized with Docker service:`, dockerService?.constructor?.name);
  }

  async configure(config: any): Promise<void> {
    console.log(`Configured ${this.name} with config:`, config);
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.dockerService) {
        console.log('❌ No Docker service available');
        return false;
      }
      
      // Check if Docker service is healthy
      const status = await this.dockerService.getServiceStatus();
      console.log(`🔍 Docker service status:`, status);
      return status.running && status.health === 'healthy';
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
        uptime: Date.now(),
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

  // DockerMediaProvider compatible methods
  async startService(): Promise<boolean> {
    if (this.dockerService && this.dockerService.startService) {
      return await this.dockerService.startService();
    }
    console.log('⚠️ Docker service does not support startService method');
    return false;
  }

  async stopService(): Promise<boolean> {
    if (this.dockerService && this.dockerService.stopService) {
      return await this.dockerService.stopService();
    }
    console.log('⚠️ Docker service does not support stopService method');
    return false;
  }

  async getServiceStatus(): Promise<any> {
    if (this.dockerService && this.dockerService.getServiceStatus) {
      return await this.dockerService.getServiceStatus();
    }
    return { running: false, health: 'unknown' };
  }
}
