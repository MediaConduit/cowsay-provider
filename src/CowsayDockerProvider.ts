import { MediaCapability, ProviderType, ProviderModel } from '@mediaconduit/mediaconduit/src/media/types/provider';
import { CowsayDockerModel } from './CowsayDockerModel';

export class CowsayDockerProvider {
  readonly id: string = 'cowsay-docker-provider';
  readonly name: string = 'Cowsay Docker Provider';
  readonly type: ProviderType = ProviderType.LOCAL;
  readonly capabilities: MediaCapability[] = [MediaCapability.TEXT_TO_TEXT];
  readonly models: ProviderModel[] = [
    {
      id: 'cowsay-default',
      name: 'Cowsay Default',
      description: 'A simple text-to-text model that generates ASCII art of a cow saying your text.',
      capabilities: [MediaCapability.TEXT_TO_TEXT],
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
    
    // Configure API client with dynamic port if service is available
    this.configureAPIClientWithDynamicPort();
  }

  private configureAPIClientWithDynamicPort(): void {
    if (this.dockerService && this.dockerService.getServiceInfo) {
      try {
        const serviceInfo = this.dockerService.getServiceInfo();
        if (serviceInfo.ports && serviceInfo.ports.length > 0) {
          const port = serviceInfo.ports[0];
          console.log(`🔗 CowsayDockerProvider configuring API client with dynamic port: ${port}`);
          // Import and configure the API client here if needed
          // The model will handle this in its constructor
        }
      } catch (error) {
        console.warn(`⚠️ Could not get service info for dynamic port configuration:`, error);
      }
    }
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
    status: 'healthy' | 'unhealthy';
    uptime: number;
    activeJobs: number;
    queuedJobs: number;
  }> {
    try {
      const isAvailable = await this.isAvailable();
      return {
        status: isAvailable ? 'healthy' : 'unhealthy',
        uptime: Date.now(),
        activeJobs: 0,
        queuedJobs: 0
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: 0,
        activeJobs: 0,
        queuedJobs: 0
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
