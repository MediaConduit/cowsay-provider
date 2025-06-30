// Basic MediaConduit types for the provider
// These would normally be imported from @mediaconduit/core

export enum ProviderType {
  LOCAL = 'local',
  REMOTE = 'remote'
}

export enum MediaCapability {
  TextToText = 'TEXT_TO_TEXT',
  TextToAudio = 'TEXT_TO_AUDIO',
  AudioToText = 'AUDIO_TO_TEXT',
  TextToImage = 'TEXT_TO_IMAGE',
  ImageToText = 'IMAGE_TO_TEXT',
  VideoToVideo = 'VIDEO_TO_VIDEO'
}

export interface ProviderModel {
  id: string;
  name: string;
  description?: string;
  capabilities: MediaCapability[];
  parameters?: Record<string, any>;
  pricing?: {
    inputCost?: number;
    outputCost?: number;
    currency: string;
  };
  limits?: {
    maxInputSize?: number;
    maxOutputSize?: number;
    rateLimit?: number;
  };
}

export interface TextToTextOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  timeout?: number;
  [key: string]: any;
}

// Asset and Role types
export abstract class AssetRole {
  abstract asRole<T extends AssetRole>(roleClass: new (...args: any[]) => T): Promise<T>;
  abstract isValid(): boolean;
}

export class Text extends AssetRole {
  constructor(
    public content: string,
    public language?: string,
    public confidence?: number,
    public metadata?: any,
    public sourceAsset?: any
  ) {
    super();
  }

  static fromString(
    content: string,
    language?: string,
    confidence?: number,
    metadata?: any,
    sourceAsset?: any
  ): Text {
    return new Text(content, language, confidence, metadata, sourceAsset);
  }

  async asRole<T extends AssetRole>(roleClass: new (...args: any[]) => T): Promise<T> {
    if (roleClass === Text as any) {
      return this as any;
    }
    throw new Error(`Cannot convert Text to ${roleClass.name}`);
  }

  isValid(): boolean {
    return typeof this.content === 'string' && this.content.length > 0;
  }
}

export type TextRole = Text;

// Provider configuration
export interface ProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  environment?: Record<string, string>;
  dockerImage?: string;
  scriptPath?: string;
  
  // Dynamic service loading configuration
  serviceUrl?: string;
  serviceConfig?: any;
  autoStartService?: boolean;
}

/**
 * Base provider interface that all providers must implement
 */
export interface MediaProvider {
  readonly id: string;
  readonly name: string;
  readonly type: ProviderType;
  readonly capabilities: MediaCapability[];
  readonly models: ProviderModel[];
  
  /**
   * Configure the provider with credentials and settings
   */
  configure(config: ProviderConfig): Promise<void>;
  
  /**
   * Check if the provider is properly configured and available
   */
  isAvailable(): Promise<boolean>;
  
  /**
   * Get available models for a specific capability
   */
  getModelsForCapability(capability: MediaCapability): ProviderModel[];
  
  /**
   * Get a model instance by ID with automatic type detection
   */
  getModel(modelId: string): Promise<any>;
  
  /**
   * Get provider health and usage statistics
   */
  getHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    activeJobs: number;
    queuedJobs: number;
    lastError?: string;
  }>;
}

// Abstract classes and base implementations

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  provider: string;
  capabilities: string[];
  inputTypes: string[];
  outputTypes: string[];
}

export abstract class TextToTextModel {
  readonly id: string;
  readonly name: string;
  readonly capabilities: MediaCapability[];

  constructor(config: ModelConfig) {
    this.id = config.id;
    this.name = config.name;
    this.capabilities = [MediaCapability.TextToText];
  }

  abstract isAvailable(): Promise<boolean>;
  abstract transform(input: TextRole | TextRole[], options?: TextToTextOptions): Promise<Text>;
  abstract generate(prompt: string, options?: TextToTextOptions): Promise<Text>;
  abstract chat(messages: { role: string; content: string; }[], options?: TextToTextOptions): Promise<Text>;
}
