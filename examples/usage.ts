import { CowsayDockerProvider, CowsayAPIClient } from '../src';

async function example() {
  // Example 1: Using the provider directly
  const provider = new CowsayDockerProvider();
  
  console.log('Provider ID:', provider.id);
  console.log('Available models:', provider.getAvailableModels());
  
  try {
    // Create a model instance
    const model = await provider.createModel('cowsay-default');
    console.log('Model created:', model.name);
    
    // Check if the model is available (service is running)
    const isAvailable = await model.isAvailable();
    console.log('Model available:', isAvailable);
    
    if (isAvailable) {
      // Generate cowsay output
      const result = await model.generate('Hello from MediaConduit!');
      console.log('Generated output:');
      console.log(result.content);
    }
  } catch (error) {
    console.error('Error using provider:', error.message);
  }
  
  // Example 2: Using the API client directly
  const client = new CowsayAPIClient({
    baseUrl: 'http://localhost:80'
  });
  
  try {
    // Check service health
    const health = await client.healthCheck();
    console.log('Service health:', health);
    
    // Generate cowsay directly
    const cowsayOutput = await client.generateCowsay('Direct API call!');
    console.log('Direct API result:');
    console.log(cowsayOutput);
  } catch (error) {
    console.error('Error using API client:', error.message);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  example().catch(console.error);
}

export { example };
