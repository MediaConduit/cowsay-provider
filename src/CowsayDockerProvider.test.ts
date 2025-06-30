import { CowsayDockerProvider } from '../src/CowsayDockerProvider';
import { CowsayAPIClient } from '../src/CowsayAPIClient';
import { MediaCapability } from '@mediaconduit/mediaconduit/src/media/types/provider';

describe('CowsayDockerProvider', () => {
  let provider: CowsayDockerProvider;

  beforeEach(() => {
    provider = new CowsayDockerProvider();
  });

  test('should have correct metadata', () => {
    expect(provider.id).toBe('cowsay-docker-provider');
    expect(provider.name).toBe('Cowsay Docker Provider');
    expect(provider.capabilities).toContain(MediaCapability.TEXT_TO_TEXT);
  });

  test('should return available models', () => {
    const models = provider.getAvailableModels();
    expect(models).toContain('cowsay-default');
  });

  test('should create cowsay-default model', async () => {
    const model = await provider.createModel('cowsay-default');
    expect(model).toBeDefined();
    expect(model.id).toBe('cowsay-default');
  });

  test('should throw error for unsupported model', async () => {
    await expect(provider.createModel('unsupported-model'))
      .rejects.toThrow('Model unsupported-model not supported');
  });
});

describe('CowsayAPIClient', () => {
  let client: CowsayAPIClient;

  beforeEach(() => {
    client = new CowsayAPIClient({
      baseUrl: 'http://localhost:80',
      timeout: 5000
    });
  });

  test('should be instantiated with correct config', () => {
    expect(client).toBeDefined();
  });

  // Note: These tests would require a running cowsay service
  // In a real test environment, you'd mock the axios calls or use a test container
});
