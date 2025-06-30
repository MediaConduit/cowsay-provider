import { CowsayDockerProvider } from './src/CowsayDockerProvider';
import { CowsayDockerModel } from './src/CowsayDockerModel';
import { Text } from './src/types';

// Mock Docker service for testing
const mockDockerService = {
  getServiceStatus: async () => ({ running: true, health: 'healthy' }),
  startService: async () => true,
  stopService: async () => true,
  execute: async (command: string, args: string[]) => {
    console.log(`Mock execution: ${command} ${args.join(' ')}`);
    return { 
      stdout: `
 ___________________________
< Hello from cowsay! 🐄 >
 ---------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`,
      stderr: '',
      exitCode: 0
    };
  }
};

async function testCowsayProvider() {
  console.log('🧪 Testing Cowsay Docker Provider...\n');

  // Test provider initialization
  const provider = new CowsayDockerProvider(mockDockerService);
  console.log('✅ Provider initialized');
  console.log(`Provider ID: ${provider.id}`);
  console.log(`Provider Name: ${provider.name}`);
  console.log(`Provider Type: ${provider.type}`);
  console.log(`Capabilities: ${provider.capabilities.join(', ')}\n`);

  // Test availability check
  const isAvailable = await provider.isAvailable();
  console.log(`✅ Provider availability: ${isAvailable}\n`);

  // Test getting a model
  try {
    const model = await provider.getModel('cowsay-default');
    console.log('✅ Model retrieved successfully');
    console.log(`Model ID: ${model.id}`);
    console.log(`Model capabilities: ${model.capabilities.join(', ')}\n`);

    // Test text transformation with proper Text input
    const textInput = new Text('Hello world!');
    const result = await model.transform(textInput);
    console.log('✅ Text transformation successful:');
    console.log(result.content);

    // Test health check
    const health = await provider.getHealth();
    console.log('✅ Health check completed:');
    console.log(`Status: ${health.status}`);
    console.log(`Active jobs: ${health.activeJobs}`);
    console.log(`Queued jobs: ${health.queuedJobs}`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCowsayProvider().catch(console.error);
